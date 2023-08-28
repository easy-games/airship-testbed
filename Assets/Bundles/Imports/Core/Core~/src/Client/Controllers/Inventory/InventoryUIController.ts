import { Controller, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { CoreUI } from "Shared/UI/CoreUI";
import { ProgressBarGraphics } from "Shared/UI/ProgressBarGraphics";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { CoreUIController } from "../UI/CoreUIController";
import { InventoryController } from "./InventoryController";

@Controller({})
export class InventoryUIController implements OnStart {
	private hotbarSlots = 9;
	private backpackShown = false;
	private showBackpackBin = new Bin();
	private mouse = new Mouse();
	private canvas: Canvas;
	private hotbarContent: Transform;
	private healthBar: ProgressBarGraphics;

	constructor(
		private readonly invController: InventoryController,
		private readonly coreUIController: CoreUIController,
	) {
		const go = this.coreUIController.refs.GetValue("Apps", "Inventory");
		this.canvas = go.GetComponent<Canvas>();
		this.canvas.enabled = true;

		const refs = go.GetComponent<GameObjectReferences>();
		this.hotbarContent = refs.GetValue("UI", "HotbarContentGO").transform;
		this.healthBar = new ProgressBarGraphics(refs.GetValue("UI", "HealthBarTransform"));
	}

	OnStart(): void {
		this.SetupHotbar();
		// this.SetupBackpack();

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.E, (event) => {
			// if (this.IsBackpackShown()) {
			//     AppManager.Close();
			// } else {
			// 	LegacyAppManager.OpenWithCustomLogic(
			// 		() => {
			// 			this.ShowBackpack();
			// 		},
			// 		() => {
			// 			this.HideBackpack();
			// 		},
			// 	);
			// }
		});
	}

	private SetupHotbar(): void {
		let init = true;
		this.invController.ObserveLocalInventory((inv) => {
			const invBin = new Bin();

			inv.SlotChanged.Connect((slot, itemStack) => {
				if (slot < this.hotbarSlots) {
					this.UpdateHotbarSlot(slot, itemStack);
				}
				if (itemStack) {
					invBin.Add(
						itemStack.AmountChanged.Connect((e) => {
							this.UpdateHotbarSlot(slot, itemStack);
						}),
					);
					invBin.Add(
						itemStack.ItemTypeChanged.Connect((e) => {
							this.UpdateHotbarSlot(slot, itemStack);
						}),
					);
				}
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
				return;
			}
			const setFill = (newHealth: number) => {
				let fill = newHealth / entity.GetMaxHealth();
				this.healthBar.SetValue(fill);
			};
			setFill(entity.GetHealth());
			entity.OnHealthChanged.Connect(setFill);
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
			return;
		}

		const itemMeta = itemStack.GetItemMeta();

		let imageSrc = itemStack.GetItemType().lower() + ".png";
		let texture2d = AssetBridge.LoadAssetIfExists<Texture2D>(`Client/Resources/Assets/ItemRenders/${imageSrc}`);
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
			const contentGO = go.transform.FindChild("Content")!.gameObject;
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

	// private SetupBackpack(): void {
	// 	const doc = GameObject.Find("InventoryBackpackUI").GetComponent<UIDocument>();
	// 	doc.enabled = true;

	// 	this.HideBackpack();
	// 	this.UpdateEntireBackpack();

	// 	const root = doc.rootVisualElement;
	// 	if (root === undefined) {
	// 		print("Backpack root was undefined.");
	// 		return;
	// 	}
	// 	const background = root.Q("Background");
	// 	UIToolkitRaycastCheckerAPI.RegisterBlockingElement(background);
	// 	for (let i = 9; i < 46; i++) {
	// 		const tile = root.Q(`Tile${i - 9}`);
	// 		const tileWrapper = tile.Q<Button>("Wrapper");
	// 		tileWrapper.clickable.OnClicked(() => {
	// 			if (!this.invController.LocalInventory) {
	// 				return;
	// 			}
	// 			this.invController.QuickMoveSlot(this.invController.LocalInventory, i);
	// 		});
	// 		UIToolkitRaycastCheckerAPI.RegisterBlockingElement(tile);
	// 	}

	// 	this.invController.ObserveLocalInventory((inv) => {
	// 		inv.SlotChanged.Connect((slot, itemStack) => {
	// 			if (slot >= this.hotbarSlots) {
	// 				const tile = root.Q(`Tile${slot - 9}`);
	// 				this.UpdateTile(tile, itemStack);
	// 			}
	// 		});

	// 		for (let i = 9; i < 46; i++) {
	// 			const itemStack = inv.GetItem(i);
	// 			const tile = root.Q(`Tile${i - 9}`);
	// 			this.UpdateTile(tile, itemStack);
	// 		}
	// 	});
	// }

	public ShowBackpack(): void {
		this.backpackShown = true;
		// const root = this.GetBackpackRoot();
		// UICore.SetDisplayStyle(root, DisplayStyle.Flex);

		const lockerId = this.mouse.AddUnlocker();
		this.showBackpackBin.Add(() => {
			this.mouse.RemoveUnlocker(lockerId);
		});
	}

	// public UpdateEntireBackpack(): void {
	// 	const root = this.GetBackpackRoot();
	// 	if (root === undefined) {
	// 		return;
	// 	}
	// 	const inv = this.invController.LocalInventory;
	// 	if (inv) {
	// 		for (let i = inv.GetHotbarSlotCount(); i < inv.GetMaxSlots(); i++) {
	// 			const tile = root.Q(`Tile${i - 9}`);
	// 			if (tile) {
	// 				this.UpdateTile(tile, inv.GetItem(i));
	// 			}
	// 		}
	// 	} else {
	// 		for (let i = 9; i < 45; i++) {
	// 			const tile = root.Q(`Tile${i - 9}`);
	// 			if (tile) {
	// 				this.UpdateTile(tile, undefined);
	// 			}
	// 		}
	// 	}
	// }

	public HideBackpack(): void {
		this.showBackpackBin.Clean();
		this.backpackShown = false;
		// const root = this.GetBackpackRoot();
		// UICore.SetDisplayStyle(root, DisplayStyle.None);
	}

	public IsBackpackShown(): boolean {
		return this.backpackShown;
	}
}
