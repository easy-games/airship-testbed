import { Controller, OnStart } from "@easy-games/flamework-core";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { OnUpdate } from "Shared/Util/Timer";
import { CoreUIController } from "../UI/CoreUIController";
import { InventoryController } from "./InventoryController";

@Controller({})
export class CreativeInventoryUIController implements OnStart {
	private refs: GameObjectReferences;
	private canvas: Canvas;
    private slotToBackpackTileMap = new Map<number, GameObject>();

	constructor(
		private readonly invController: InventoryController,
		private readonly coreUIController: CoreUIController,
	) {
		const backpackGo = GameObjectUtil.Instantiate(
			AssetBridge.Instance.LoadAsset(
				"Imports/Core/Shared/Resources/Prefabs/UI/Inventory/CreativeBackpack.prefab",
			),
		);
		this.refs = backpackGo.GetComponent<GameObjectReferences>();
		this.canvas = backpackGo.GetComponent<Canvas>();
		this.canvas.enabled = false;
	}

	OnStart(): void {}

	private Setup(): void {
		const mouse = new Mouse();
		const keyboard = new Keyboard();

		const hotbarContent = this.refs.GetValue("Backpack", "HotbarContent");
		for (let i = 0; i < 9; i++) {
			const t = hotbarContent.transform.GetChild(i);
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
								if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
									this.invController.QuickMoveSlot(this.invController.LocalInventory, i);
								}
							} else {
								this.invController.SetHeldSlot(i);
							}
						} else {
							// backpack
							if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
								this.invController.QuickMoveSlot(this.invController.LocalInventory, i);
							}
						}
					});
					CanvasAPI.OnBeginDragEvent(button, () => {
						this.draggingBin.Clean();
						if (!this.IsBackpackShown()) return;
						if (keyboard.IsKeyDown(KeyCode.LeftShift)) return;

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
							if (!this.draggingState.consumed) {
								this.invController.DropItemInSlot(
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
	}

	public Open(): void {}

	public Close(): void {}
}
