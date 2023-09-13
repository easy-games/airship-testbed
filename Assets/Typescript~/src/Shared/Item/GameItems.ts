import { ItemType } from "Core/Shared/Item/ItemType";
import { ItemRegistrationConfig, ItemUtil } from "Imports/Core/Shared/Item/ItemUtil";

declare module "Core/Shared/Item/ItemType" {
	export const enum ItemType {
		EXAMPLE_ITEM = "EXAMPLE_ITEM",
	}
}

export function RegisterItems() {
	const config: ItemRegistrationConfig = {
		accessoryFolder: "Shared/Resources/Accessories",
	};
	ItemUtil.RegisterItem(
		ItemType.EXAMPLE_ITEM,
		{
			displayName: "Example Item",
			image: "Imports/Core/Shared/Resources/Images/ProfilePictures/Dom.png",
			accessoryPaths: ["example_item.asset"],
		},
		config,
	);
}
