import { Airship } from "@Easy/Core/Shared/Airship";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";

export default class InventoryDemoManager extends AirshipSingleton {
	override Start(): void {
		Airship.Inventory.RegisterItem("WoodSword", {
			displayName: "Wood Sword",
			maxStackSize: 1,
			accessoryPaths: ["Assets/Resources/Prefabs/WoodSword.prefab"],
			// image: "Assets/Resources/ItemRenders/wood_sword.png",
		});
		Airship.Characters.ObserveCharacters((c) => {
			c.inventory.AddItem(new ItemStack("WoodSword"));
		});
	}

	override OnDestroy(): void {}
}
