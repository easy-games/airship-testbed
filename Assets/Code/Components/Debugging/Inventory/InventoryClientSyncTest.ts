import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";

const HUMAN_REFRESH_RATE = 0.15; // "Fastest possible reaction time" (which happens to also match our 'spawn cooldown' w/ the bug)
export default class InventoryClientSyncTest extends AirshipBehaviour {
	private transferThread?: thread;

	override Start(): void {
		const inventory = this.gameObject.GetAirshipComponent<Inventory>();
		if (!inventory) return;

		if (Game.IsClient()) {
			Airship.Inventory.onInventoryOpened.Connect((event) => {
				if (event.inventory !== inventory) return;

				this.transferThread = task.spawn(() => {
					while (task.wait(HUMAN_REFRESH_RATE)) {
						const slot = Airship.Inventory.localInventory?.FindSlotWithItemType("Iron");
						if (!slot) return;
						Airship.Inventory.MoveToInventory(Airship.Inventory.localInventory!, slot, inventory);
					}
				});
			});
			Airship.Inventory.onInventoryClosed.Connect((event) => {
				if (event.inventory !== inventory) return;

				if (this.transferThread) {
					task.cancel(this.transferThread);
					this.transferThread = undefined;
				}
			});

			const prompt = Airship.Input.CreateProximityPrompt("Interact", "Test Chest", "Test", this.transform);
			prompt.onActivated.Connect(() => {
				const closeInventory = Airship.Inventory.OpenExternalInventory(inventory);
			});
		}
	}

	protected Update(dt: number): void {}

	override OnDestroy(): void {}
}
