import { Controller, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Inventory } from "Shared/Inventory/Inventory";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { CoreUI } from "Shared/UI/CoreUI";
import { Healthbar } from "Shared/UI/Healthbar";
import { Keyboard, Mouse } from "Shared/UserInput";
import { AppManager } from "Shared/Util/AppManager";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { OnUpdate } from "Shared/Util/Timer";
import { CoreUIController } from "../UI/CoreUIController";
import { InventoryController } from "./InventoryController";

type DraggingState = {
	inventory: Inventory;
	itemStack: ItemStack;
	slot: number;
	transform: RectTransform;
	consumed: boolean;
};

@Controller({})
export class InventoryUIController implements OnStart {
	private hotbarSlots = 9;
	private backpackShown = false;
	private canvas: Canvas;
	private hotbarContent: Transform;
	private healthBar: Healthbar;
	private inventoryRefs: GameObjectReferences;

	private backpackRefs: GameObjectReferences;
	private backpackCanvas: Canvas;

	private slotToBackpackTileMap = new Map<number, GameObject>();
	private enabled = true;
	private draggingState: DraggingState | undefined;
	private draggingBin = new Bin();

	constructor(
		private readonly invController: InventoryController,
		private readonly coreUIController: CoreUIController,
	) {
		const go = this.coreUIController.refs.GetValue("Apps", "Inventory");
		this.canvas = go.GetComponent<Canvas>();
		this.canvas.enabled = true;

		this.inventoryRefs = go.GetComponent<GameObjectReferences>();
		this.hotbarContent = this.inventoryRefs.GetValue("UI", "HotbarContentGO").transform;
		this.healthBar = new Healthbar(this.inventoryRefs.GetValue("UI", "HealthBarTransform"));

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

	public SetEnabled(enabled: boolean): void {
		if (this.enabled === enabled) return;

		if (!enabled) {
			this.canvas.enabled = false;
		}
	}

	public OpenBackpack(): void {
		if (!this.enabled) return;

		this.backpackShown = true;

		const wrapper = this.backpackCanvas.transform.GetChild(0).GetComponent<RectTransform>();
		wrapper.anchoredPosition = Bridge.MakeVector2(0, -20);
		wrapper.TweenAnchoredPositionY(0, 0.12);

		AppManager.Open(this.backpackCanvas, {
			onClose: () => {
				this.backpackShown = false;
			},
		});
	}

	private SetupHotbar(): void {
		for (let i = 0; i < this.hotbarSlots; i++) {
			this.UpdateHotbarSlot(i, this.invController.LocalInventory?.GetHeldSlot() ?? 0, undefined, true);
		}

		let init = false;
		this.invController.ObserveLocalInventory((inv) => {
			const invBin = new Bin();
			const slotBinMap = new Map<number, Bin>();
			invBin.Add(
				inv.SlotChanged.Connect((slot, itemStack) => {
					slotBinMap.get(slot)?.Clean();
					if (slot < this.hotbarSlots) {
						const slotBin = new Bin();
						slotBinMap.set(slot, slotBin);

						this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);

						if (itemStack) {
							slotBin.Add(
								itemStack.AmountChanged.Connect((e) => {
									this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);
								}),
							);
							slotBin.Add(
								itemStack.ItemTypeChanged.Connect((e) => {
									this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);
								}),
							);
						}
					}
				}),
			);

			invBin.Add(() => {
				for (const pair of slotBinMap) {
					pair[1].Clean();
				}
				slotBinMap.clear();
			});

			invBin.Add(
				inv.HeldSlotChanged.Connect((slot) => {
					for (let i = 0; i < this.hotbarSlots; i++) {
						const itemStack = inv.GetItem(i);
						this.UpdateHotbarSlot(i, slot, itemStack);
					}
					this.prevHeldSlot = slot;
				}),
			);

			for (let i = 0; i < this.hotbarSlots; i++) {
				const itemStack = inv.GetItem(i);
				this.UpdateHotbarSlot(i, inv.GetHeldSlot(), itemStack, init, true);
			}
			this.prevHeldSlot = inv.GetHeldSlot();
			init = false;

			return () => {
				invBin.Clean();
			};
		});

		// Healthbar
		Game.LocalPlayer.ObserveCharacter((entity) => {
			const bin = new Bin();

			if (entity === undefined) {
				this.healthBar.SetValue(0);
				this.healthBar.transform.gameObject.SetActive(false);
				return;
			}
			this.healthBar.transform.gameObject.SetActive(true);
			const SetFill = (newHealth: number, instant: boolean) => {
				let fill = newHealth / entity.GetMaxHealth();
				if (instant) {
					this.healthBar.InstantlySetValue(fill);
				} else {
					this.healthBar.SetValue(fill);
				}
			};
			SetFill(entity.GetHealth(), false);
			bin.Add(
				entity.OnHealthChanged.Connect((h) => {
					SetFill(h, false);
				}),
			);

			// Armor label
			const armorLabelImage = this.inventoryRefs.GetValue("Healthbar", "ArmorLabelImage") as Image;
			const armorLabelText = this.inventoryRefs.GetValue("Healthbar", "ArmorLabelText") as TMP_Text;
			const SetArmor = (armor: number) => {
				if (armor === 0) {
					armorLabelImage.gameObject.SetActive(false);
					armorLabelText.gameObject.SetActive(false);
					return;
				}
				armorLabelImage.gameObject.SetActive(true);
				armorLabelText.gameObject.SetActive(true);
				armorLabelText.text = armor + "";
			};
			if (entity === undefined) {
				SetArmor(0);
			} else {
				SetArmor(entity.GetArmor());
				bin.Add(
					entity.OnArmorChanged.Connect((armor) => {
						SetArmor(armor);
					}),
				);
			}
			return () => {
				bin.Clean();
			};
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

	private prevHeldSlot = -2;
	private UpdateHotbarSlot(
		slot: number,
		selectedSlot: number,
		itemStack: ItemStack | undefined,
		init = false,
		reset = false,
	): void {
		const go = this.hotbarContent.GetChild(slot).gameObject;
		this.UpdateTile(go, itemStack);

		const contentGO = go.transform.GetChild(0).gameObject;
		const contentRect = contentGO.GetComponent<RectTransform>();
		if (selectedSlot === slot && (this.prevHeldSlot !== slot || reset)) {
			contentRect.TweenAnchoredPositionY(10, 0.1);
		} else if (selectedSlot !== slot && (this.prevHeldSlot === slot || reset)) {
			contentRect.TweenAnchoredPositionY(0, 0.1);
		}

		if (init) {
			CoreUI.SetupButton(contentGO);
		}
	}

	private SetupBackpack(): void {
		const mouse = new Mouse();

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
		let init = true;
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

			// Setup connections
			for (let i = 0; i < inv.GetMaxSlots(); i++) {
				const tile = this.slotToBackpackTileMap.get(i)!;
				this.UpdateTile(tile, inv.GetItem(i));

				// Prevent listening to connections multiple times
				if (init) {
					CoreUI.SetupButton(tile);
					const button = tile.transform.GetChild(0).gameObject;
					CanvasAPI.OnClickEvent(button, () => {
						if (!this.invController.LocalInventory) return;

						if (i < this.hotbarSlots) {
							// hotbar
							if (this.IsBackpackShown()) {
								// this.invController.QuickMoveSlot(this.invController.LocalInventory, slot);
							} else {
								this.invController.SetHeldSlot(i);
							}
						} else {
							// backpack
							this.invController.QuickMoveSlot(this.invController.LocalInventory, i);
						}
					});
					CanvasAPI.OnBeginDragEvent(button, () => {
						this.draggingBin.Clean();
						if (!this.IsBackpackShown()) return;

						if (!this.invController.LocalInventory) return;
						const itemStack = this.invController.LocalInventory.GetItem(i);
						if (!itemStack) return;

						const visual = button.transform.GetChild(0).gameObject;
						const clone = Object.Instantiate(visual, this.backpackCanvas.transform) as GameObject;
						clone.transform.SetAsLastSibling();

						const cloneRect = clone.GetComponent<RectTransform>();
						cloneRect.sizeDelta = Bridge.MakeVector2(100, 100);
						const cloneImage = clone.transform.GetChild(0).GetComponent<Image>();
						cloneImage.raycastTarget = false;

						visual.SetActive(false);

						const cloneTransform = clone.GetComponent<RectTransform>();
						cloneTransform.position = mouse.GetLocation();

						this.draggingBin.Add(
							OnUpdate.Connect((dt) => {
								cloneTransform.position = mouse.GetLocation();
							}),
						);
						this.draggingBin.Add(() => {
							visual.SetActive(true);
						});

						this.draggingState = {
							slot: i,
							itemStack,
							inventory: this.invController.LocalInventory,
							transform: cloneTransform,
							consumed: false,
						};
					});

					// Called before end
					CanvasAPI.OnDropEvent(tile.transform.GetChild(0).gameObject, () => {
						if (!this.IsBackpackShown()) return;
						if (!this.draggingState) return;
						if (!this.invController.LocalInventory) return;

						this.invController.MoveToSlot(
							this.draggingState.inventory,
							this.draggingState.slot,
							this.invController.LocalInventory,
							i,
							this.draggingState.itemStack.GetAmount(),
						);
						this.draggingState.consumed = true;
					});

					// Called after drop
					CanvasAPI.OnEndDragEvent(button, () => {
						this.draggingBin.Clean();

						if (this.draggingState) {
							Object.Destroy(this.draggingState.transform.gameObject);

							if (!this.draggingState.consumed) {
								this.invController.DropItemInSlot(
									this.draggingState.slot,
									this.draggingState.itemStack.GetAmount(),
								);
							}

							this.draggingState = undefined;
						}
					});
				}
			}
			init = false;
		});
	}

	public IsBackpackShown(): boolean {
		return this.backpackShown;
	}
}
