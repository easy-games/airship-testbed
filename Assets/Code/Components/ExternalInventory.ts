import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";

export default class ExternalInventory extends AirshipBehaviour {
	name = "Chest";

	override Start(): void {
		const inventory = this.gameObject.GetAirshipComponent<Inventory>();
		assert(inventory, "Expected Inventory");

		if (Game.IsServer()) {
			task.delay(5, () => {
				inventory.AddItem(new ItemStack("WoodSword"));
			});
		}

		const prompt = Airship.Input.CreateProximityPrompt("Interact", this.name, "Open", this.transform);
		prompt.transform.localPosition = new Vector3(0, 0.5, 0);

		prompt.onActivated.Connect(() => {
			Airship.Inventory.OpenExternalInventory(inventory);
		});
	}

	override OnDestroy(): void {}
}
