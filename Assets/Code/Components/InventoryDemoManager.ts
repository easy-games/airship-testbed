import { Airship } from "@Easy/Core/Shared/Airship";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";

export const enum DemoItemType {
	WoodSword = "WoodSword",
}

export default class InventoryDemoManager extends AirshipSingleton {
	override Start(): void {
		Airship.Inventory.RegisterItem(DemoItemType.WoodSword, {
			displayName: "Wood Sword",
			maxStackSize: 1,
			accessoryPaths: ["Assets/Resources/Prefabs/WoodSword.prefab"],
			image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/HandsUp.png",
		});
		Airship.Characters.ObserveCharacters((c) => {
			c.inventory.AddItem(new ItemStack(DemoItemType.WoodSword));
		});
	}

	override OnDestroy(): void {}
}
