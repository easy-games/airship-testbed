import { Controller, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { CoreUI } from "Shared/UI/CoreUI";
import { ProgressBarGraphics } from "Shared/UI/ProgressBarGraphics";
import { Keyboard } from "Shared/UserInput";
import { AppManager } from "Shared/Util/AppManager";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { CoreUIController } from "../UI/CoreUIController";
import { InventoryController } from "./InventoryController";

@Controller({})
export class InventoryUIController implements OnStart {
	private hotbarSlots = 9;
	private backpackShown = false;
	private canvas: Canvas;
	private hotbarContent: Transform;
	private healthBar: ProgressBarGraphics;
	private hotbarRefs: GameObjectReferences;

	private backpackRefs: GameObjectReferences;
	private backpackCanvas: Canvas;

	private slotToBackpackTileMap = new Map<number, GameObject>();

	constructor(
		private readonly invController: InventoryController,
		private readonly coreUIController: CoreUIController,
	) {
		const go = this.coreUIController.refs.GetValue("Apps", "Inventory");
		this.canvas = go.GetComponent<Canvas>();
		this.canvas.enabled = true;

		this.hotbarRefs = go.GetComponent<GameObjectReferences>();
		this.hotbarContent = this.hotbarRefs.GetValue("UI", "HotbarContentGO").transform;
		this.healthBar = new ProgressBarGraphics(this.hotbarRefs.GetValue("UI", "HealthBarTransform"));

		const backpackGo = GameObjectUtil.Instantiate(
			AssetBridge.Instance.LoadAsset("Imports/Core/Shared/Resources/Prefabs/UI/Inventory/Backpack.prefab"),
		);
		this.backpackRefs = backpackGo.GetComponent<GameObjectReferences>();
		this.backpackCanvas = backpackGo.GetComponent<Canvas>();
		this.backpackCanvas.enabled = false;
	}

	OnStart(): void {
		this.SetupHotbar();
		this.SetupBackpack();

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.E, (event) => {
			if (this.IsBackpackShown()) {
				AppManager.Close();
			} else {
				this.OpenBackpack();
			}
		});
	}

	public OpenBackpack(): void {
		this.backpackShown = true;

		AppManager.Open(this.backpackCanvas, {
			onClose: () => {
				this.backpackShown = false;
			},
		});
	}

	private SetupHotbar(): void {
		for (let i = 0; i < this.hotbarSlots; i++) {
			this.UpdateHotbarSlot(i, undefined, true);
		}

		let init = false;
		this.invController.ObserveLocalInventory((inv) => {
			const invBin = new Bin();

			const slotBinMap = new Map<number, Bin>();
			inv.SlotChanged.Connect((slot, itemStack) => {
				slotBinMap.get(slot)?.Clean();
				if (slot < this.hotbarSlots) {
					const slotBin = new Bin();
					slotBinMap.set(slot, slotBin);

					this.UpdateHotbarSlot(slot, itemStack);

					if (itemStack) {
						slotBin.Add(
							itemStack.AmountChanged.Connect((e) => {
								this.UpdateHotbarSlot(slot, itemStack);
							}),
						);
						slotBin.Add(
							itemStack.ItemTypeChanged.Connect((e) => {
								this.UpdateHotbarSlot(slot, itemStack);
							}),
						);
					}
				}
			});

			invBin.Add(() => {
				for (const pair of slotBinMap) {
					pair[1].Clean();
				}
				slotBinMap.clear();
			});

			inv.HeldSlotChanged.Connect((slot) => {
				for (let i = 0; i < this.hotbarSlots; i++) {
					const itemStack = inv.GetItem(i);
					this.UpdateHotbarSlot(i, itemStack);
				}
			});

			for (let i = 0; i < this.hotbarSlots; i++) {
				const itemStack = inv.GetItem(i);
				this.UpdateHotbarSlot(i, itemStack, init);
			}
			init = false;

			return () => {
				invBin.Clean();
			};
		});

		// Healthbar
		Game.LocalPlayer.ObserveCharacter((entity) => {
			if (entity === undefined) {
				this.healthBar.SetValue(0);
				this.healthBar.transform.gameObject.SetActive(false);
				return;
			}
			this.healthBar.transform.gameObject.SetActive(true);
			const setFill = (newHealth: number, instant: boolean) => {
				let fill = newHealth / entity.GetMaxHealth();
				if (instant) {
					this.healthBar.InstantlySetValue(fill);
				} else {
					this.healthBar.SetValue(fill);
				}
			};
			setFill(entity.GetHealth(), false);
			entity.OnHealthChanged.Connect((h) => {
				setFill(h, false);
			});
		});
	}

	private UpdateTile(tile: GameObject, itemStack: ItemStack | undefined): void {
		const refs = tile.GetComponent<GameObjectReferences>();
		const image = refs.GetValue<Image>("UI", "Image");
		const amount = refs.GetValue<TMP_Text>("UI", "Amount");
		const name = refs.GetValue<TMP_Text>("UI", "Name");

		if (!itemStack) {
			image.enabled = false;
			amount.enabled = false;
			name.enabled = false;
			return;
		}

		const itemMeta = itemStack.GetItemMeta();

		let imageSrc = itemStack.GetItemType().lower() + ".png";
		let texture2d = AssetBridge.Instance.LoadAssetIfExists<Texture2D>(
			`Client/Resources/Assets/ItemRenders/${imageSrc}`,
		);
		if (texture2d) {
			image.sprite = Bridge.MakeSprite(texture2d);
			image.enabled = true;
			name.enabled = false;
		} else {
			name.text = itemMeta.displayName;
			name.enabled = true;
			image.enabled = false;
		}

		amount.enabled = true;
		if (itemStack.GetAmount() > 1) {
			amount.text = itemStack.GetAmount() + "";
		} else {
			amount.text = "";
		}
	}

	private UpdateHotbarSlot(slot: number, itemStack: ItemStack | undefined, init = false): void {
		const selectedSlot = this.invController.LocalInventory?.GetSelectedSlot() ?? -1;

		const go = this.hotbarContent.GetChild(slot).gameObject;
		this.UpdateTile(go, itemStack);

		const animator = go.GetComponent<Animator>();
		animator.SetBool("Selected", selectedSlot === slot);

		if (init) {
			const contentGO = go.transform.GetChild(0).gameObject;
			CoreUI.SetupButton(contentGO);
			CanvasAPI.OnClickEvent(contentGO, () => {
				if (this.IsBackpackShown() && this.invController.LocalInventory) {
					this.invController.QuickMoveSlot(this.invController.LocalInventory, slot);
				} else {
					this.invController.SetHeldSlot(slot);
				}
			});
		}
	}

	private SetupBackpack(): void {
		const hotbarContent = this.backpackRefs.GetValue("Backpack", "HotbarContent");
		for (let i = 0; i < 9; i++) {
			const t = hotbarContent.transform.GetChild(i);
			this.slotToBackpackTileMap.set(i, t.gameObject);
		}

		const backpackContent = this.backpackRefs.GetValue("Backpack", "BackpackContent");
		for (let i = 9; i < 45; i++) {
			const t = backpackContent.transform.GetChild(i - 9);
			this.slotToBackpackTileMap.set(i, t.gameObject);
		}

		const armorContent = this.backpackRefs.GetValue("Backpack", "ArmorContent");
		for (let i = 45; i <= 47; i++) {
			const t = armorContent.transform.GetChild(i - 45);
			this.slotToBackpackTileMap.set(i, t.gameObject);
		}

		const invBin = new Bin();
		this.invController.ObserveLocalInventory((inv) => {
			invBin.Clean();
			const slotBinMap = new Map<number, Bin>();

			inv.SlotChanged.Connect((slot, itemStack) => {
				slotBinMap.get(slot)?.Clean();
				const slotBin = new Bin();
				slotBinMap.set(slot, slotBin);

				const tile = this.slotToBackpackTileMap.get(slot)!;
				this.UpdateTile(tile, itemStack);

				if (itemStack) {
					slotBin.Add(
						itemStack.AmountChanged.Connect((e) => {
							this.UpdateTile(tile, itemStack);
						}),
					);
					slotBin.Add(
						itemStack.ItemTypeChanged.Connect((e) => {
							this.UpdateTile(tile, itemStack);
						}),
					);
				}
			});
			invBin.Add(() => {
				for (const pair of slotBinMap) {
					pair[1].Clean();
				}
				slotBinMap.clear();
			});

			for (let i = 0; i < inv.GetMaxSlots(); i++) {
				const tile = this.slotToBackpackTileMap.get(i)!;
				this.UpdateTile(tile, inv.GetItem(i));

				CoreUI.SetupButton(tile);
				CanvasAPI.OnClickEvent(tile.transform.GetChild(0).gameObject, () => {
					if (!this.invController.LocalInventory) return;
					this.invController.QuickMoveSlot(this.invController.LocalInventory, i);
				});
			}
		});
	}

	public IsBackpackShown(): boolean {
		return this.backpackShown;
	}
}
