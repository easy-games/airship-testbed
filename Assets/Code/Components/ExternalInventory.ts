import { Airship } from "@Easy/Core/Shared/Airship";
import Inventory from "@Easy/Core/Shared/Inventory/Inventory";

export default class ExternalInventory extends AirshipBehaviour {
	name = "Chest";

	override Start(): void {
		const inventory = this.gameObject.GetAirshipComponent<Inventory>();
		assert(inventory, "Expected Inventory");

		const prompt = Airship.Input.CreateProximityPrompt("Interact", this.name, "Open", this.transform);
		prompt.transform.localPosition = new Vector3(0, 0.5, 0);

		prompt.onActivated.Connect(() => {
			Airship.Inventory.OpenExternalInventory(inventory);
		});
	}

	override OnDestroy(): void {}
}
