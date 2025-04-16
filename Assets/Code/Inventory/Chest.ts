import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";

export default class Chest extends AirshipBehaviour {
	private inventory: Inventory;

	override Start(): void {
		this.inventory ??= this.gameObject.GetAirshipComponent<Inventory>()!;
		if (!this.inventory) return;

		if (Game.IsClient()) {
			const prompt = Airship.Input.CreateProximityPrompt("Interact", "Chest", "Open", this.transform);
			prompt.onActivated.Connect(() => {
				Airship.Inventory.OpenExternalInventory(this.inventory);
			});
		}
	}

	override OnDestroy(): void {}
}
