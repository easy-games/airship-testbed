import { Airship } from "@Easy/Core/Shared/Airship";
import { AssetCache } from "Shared/AssetCache/AssetCache";
import { CoreRefs } from "Shared/CoreRefs";
import { Controller, OnStart } from "Shared/Flamework";
import { Game } from "Shared/Game";
import { CharacterInventorySingleton } from "Shared/Inventory/CharacterInventorySingleton";
import Inventory from "Shared/Inventory/Inventory";
import { InventorySingleton } from "Shared/Inventory/InventorySingleton";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { CoreUI } from "Shared/UI/CoreUI";
import { Healthbar } from "Shared/UI/Healthbar";
import { Keyboard, Mouse } from "Shared/UserInput";
import { AppManager } from "Shared/Util/AppManager";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { OnUpdate } from "Shared/Util/Timer";
import { CoreUIController } from "../UI/CoreUIController";

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
	private hotbarCanvas: Canvas;
	private hotbarContent: Transform;
	private healthBar: Healthbar;
	private inventoryRefs: GameObjectReferences;

	private backpackRefs: GameObjectReferences;
	private backpackCanvas: Canvas;

	private slotToBackpackTileMap = new Map<number, GameObject>();
	private enabled = true;
	private draggingState: DraggingState | undefined;
	private draggingBin = new Bin();
	private spriteCache = new Map<ItemType, Sprite>();

	constructor(
		private readonly invController: InventorySingleton,
		private readonly characterInvController: CharacterInventorySingleton,
		private readonly coreUIController: CoreUIController,
	) {
		const go = this.coreUIController.refs.GetValue("Apps", "Inventory");
		this.hotbarCanvas = go.GetComponent<Canvas>();
		this.hotbarCanvas.enabled = true;

		this.inventoryRefs = go.GetComponent<GameObjectReferences>();
		this.hotbarContent = this.inventoryRefs.GetValue("UI", "HotbarContentGO").transform;
		this.healthBar = new Healthbar(this.inventoryRefs.GetValue("UI", "HealthBarTransform"));

		const backpackGo = Object.Instantiate(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/Inventory/Backpack.prefab"),
			CoreRefs.rootTransform,
		);
		this.backpackRefs = backpackGo.GetComponent<GameObjectReferences>();
		this.backpackCanvas = backpackGo.GetComponent<Canvas>();
		this.backpackCanvas.enabled = false;
	}

	OnStart(): void {
		this.SetupHotbar();
		this.SetupBackpack();

		Airship.input.OnDown("Inventory").Connect((event) => {
			if (event.uiProcessed || !this.enabled) return;
			if (this.IsBackpackShown() || AppManager.IsOpen()) {
				AppManager.Close();
			} else {
				this.OpenBackpack();
			}
		});
	}

	public SetEnabled(enabled: boolean): void {
		if (this.enabled === enabled) return;
		this.enabled = enabled;

		this.hotbarCanvas.enabled = enabled;
	}

	public OpenBackpack(): void {
		if (!this.enabled) return;

		this.backpackShown = true;

		const wrapper = this.backpackCanvas.transform.GetChild(0).GetComponent<RectTransform>();
		wrapper.anchoredPosition = new Vector2(0, -20);
		wrapper.TweenAnchoredPositionY(0, 0.12);

		this.hotbarCanvas.enabled = false;

		AppManager.Open(this.backpackCanvas, {
			onClose: () => {
				this.backpackShown = false;
				this.hotbarCanvas.enabled = true;
			},
		});
	}

	private SetupHotbar(): void {
		for (let i = 0; i < this.hotbarSlots; i++) {
			this.UpdateHotbarSlot(i, this.characterInvController.localInventory?.GetHeldSlot() ?? 0, undefined, true);
		}

		let init = false;
		this.characterInvController.ObserveLocalInventory((inv) => {
			const invBin = new Bin();
			const slotBinMap = new Map<number, Bin>();
			invBin.Add(
				inv.slotChanged.Connect((slot, itemStack) => {
					slotBinMap.get(slot)?.Clean();
					if (slot < this.hotbarSlots) {
						const slotBin = new Bin();
						slotBinMap.set(slot, slotBin);

						this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);

						if (itemStack) {
							slotBin.Add(
								itemStack.amountChanged.Connect((e) => {
									this.UpdateHotbarSlot(slot, inv.GetHeldSlot(), itemStack);
								}),
							);
							slotBin.Add(
								itemStack.itemTypeChanged.Connect((e) => {
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
				inv.heldSlotChanged.Connect((slot) => {
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
		Game.localPlayer.ObserveCharacter((character) => {
			const bin = new Bin();

			if (character === undefined) {
				this.healthBar.SetValue(0);
				this.healthBar.transform.gameObject.SetActive(false);
				this.SetEnabled(false);
				return;
			}
			this.SetEnabled(true);

			this.healthBar.transform.gameObject.SetActive(true);
			const SetFill = (newHealth: number, instant: boolean) => {
				let fill = newHealth / character.GetMaxHealth();
				if (instant) {
					this.healthBar.InstantlySetValue(fill);
				} else {
					this.healthBar.SetValue(fill);
				}
			};
			SetFill(character.GetHealth(), false);
			bin.Add(
				character.onHealthChanged.Connect((h) => {
					SetFill(h, false);
				}),
			);
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

		const itemMeta = itemStack.GetItemDef();
		const itemType = itemStack.GetItemType();
		let imageSrc = itemMeta.image;
		let texture2d: Texture2D | undefined;
		if (imageSrc) {
			texture2d = AssetCache.LoadAssetIfExists<Texture2D>(imageSrc);
		}
		if (texture2d) {
			let cachedSprite = this.spriteCache.get(itemMeta.itemType);
			if (!cachedSprite) {
				cachedSprite = Bridge.MakeSprite(texture2d);
				this.spriteCache.set(itemType, cachedSprite);
			}
			image.sprite = cachedSprite;
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
		const keyboard = new Keyboard();

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
		this.characterInvController.ObserveLocalInventory((inv) => {
			invBin.Clean();
			const slotBinMap = new Map<number, Bin>();

			inv.slotChanged.Connect((slot, itemStack) => {
				slotBinMap.get(slot)?.Clean();
				const slotBin = new Bin();
				slotBinMap.set(slot, slotBin);

				const tile = this.slotToBackpackTileMap.get(slot)!;
				this.UpdateTile(tile, itemStack);

				if (itemStack) {
					slotBin.Add(
						itemStack.amountChanged.Connect((e) => {
							this.UpdateTile(tile, itemStack);
						}),
					);
					slotBin.Add(
						itemStack.itemTypeChanged.Connect((e) => {
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
						if (!this.characterInvController.localInventory) return;

						if (i < this.hotbarSlots) {
							// hotbar
							if (this.IsBackpackShown()) {
								if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
									this.invController.QuickMoveSlot(this.characterInvController.localInventory, i);
								}
							} else {
								this.characterInvController.SetHeldSlot(i);
							}
						} else {
							// backpack
							if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
								this.invController.QuickMoveSlot(this.characterInvController.localInventory, i);
							}
						}
					});
					CanvasAPI.OnBeginDragEvent(button, () => {
						this.draggingBin.Clean();
						if (!this.IsBackpackShown()) return;
						if (keyboard.IsKeyDown(KeyCode.LeftShift)) return;

						if (!this.characterInvController.localInventory) return;
						const itemStack = this.characterInvController.localInventory.GetItem(i);
						if (!itemStack) return;

						const visual = button.transform.GetChild(0).gameObject;
						const clone = Object.Instantiate(visual, this.backpackCanvas.transform) as GameObject;
						clone.transform.SetAsLastSibling();

						const cloneRect = clone.GetComponent<RectTransform>();
						cloneRect.sizeDelta = new Vector2(100, 100);
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
							inventory: this.characterInvController.localInventory,
							transform: cloneTransform,
							consumed: false,
						};
					});

					// Called before end
					CanvasAPI.OnDropEvent(tile.transform.GetChild(0).gameObject, () => {
						if (!this.IsBackpackShown()) return;
						if (!this.draggingState) return;
						if (!this.characterInvController.localInventory) return;

						this.invController.MoveToSlot(
							this.draggingState.inventory,
							this.draggingState.slot,
							this.characterInvController.localInventory,
							i,
							this.draggingState.itemStack.GetAmount(),
						);
						this.draggingState.consumed = true;
					});

					// Called after drop
					CanvasAPI.OnEndDragEvent(button, () => {
						this.draggingBin.Clean();

						if (this.draggingState) {
							if (!this.draggingState.consumed) {
								this.characterInvController.DropItemInSlot(
									this.draggingState.slot,
									this.draggingState.itemStack.GetAmount(),
								);
							}

							Object.Destroy(this.draggingState.transform.gameObject);
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
