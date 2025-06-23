import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";

export const enum InventoryTestType {
	TransferToChestTooQuickly,
	TransferBetweenSlotsTooQuickly,
}

const HUMAN_LATENCY = 0.15; // "Fastest possible reaction time" (which happens to also match our 'spawn cooldown' w/ the bug)
export default class InventoryClientSyncTest extends AirshipBehaviour {
	public testType = InventoryTestType.TransferToChestTooQuickly;

	private transferThread?: thread;

	override Start(): void {
		const inventory = this.gameObject.GetAirshipComponent<Inventory>();
		if (!inventory) return;

		if (Game.IsClient()) {
			Airship.Inventory.onInventoryOpened.Connect((event) => {
				if (event.inventory !== inventory) return;

				if (this.testType === InventoryTestType.TransferToChestTooQuickly) {
					this.transferThread = task.spawn(() => {
						while (true) {
							const slot = Airship.Inventory.localInventory?.FindSlotWithItemType("Iron");
							if (slot === undefined) {
								return;
							}

							Airship.Inventory.MoveToInventory(Airship.Inventory.localInventory!, slot, inventory);
							task.wait(HUMAN_LATENCY);
						}
					});
				} else if (this.testType === InventoryTestType.TransferBetweenSlotsTooQuickly) {
					this.transferThread = task.spawn(() => {
						const slot = Airship.Inventory.localInventory?.FindSlotWithItemType("Iron");
						if (slot === undefined) return;

						const targetSlot = Airship.Inventory.localInventory?.GetFirstOpenSlot();
						if (targetSlot === undefined) return;

						while (true) {
							Airship.Inventory.MoveToSlot(
								Airship.Inventory.localInventory!,
								slot,
								Airship.Inventory.localInventory!,
								targetSlot,
							);
							task.wait(HUMAN_LATENCY);
							Airship.Inventory.MoveToSlot(
								Airship.Inventory.localInventory!,
								targetSlot,
								Airship.Inventory.localInventory!,
								slot,
							);
							task.wait(HUMAN_LATENCY);
						}
					});
				}
			});
			Airship.Inventory.onInventoryClosed.Connect((event) => {
				if (event.inventory !== inventory) return;
				if (this.transferThread) this.transferThread = void task.cancel(this.transferThread);
			});

			let promptText: string;
			switch (this.testType) {
				case InventoryTestType.TransferToChestTooQuickly:
					promptText = "Inventory Transfer Test";
					break;
				case InventoryTestType.TransferBetweenSlotsTooQuickly:
					promptText = "Slot Transfer Test";
					break;
			}

			const prompt = Airship.Input.CreateProximityPrompt("Interact", "Chest", promptText, this.transform);
			prompt.onActivated.Connect(() => {
				Airship.Inventory.OpenExternalInventory(inventory);
			});
		}
	}
}
