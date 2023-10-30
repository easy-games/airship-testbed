import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ItemRegistrationConfig, ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";

declare module "@Easy/Core/Shared/Item/ItemType" {
	/**
	 * @scope Easy/Bedwars
	 */
	export const enum ItemType {
		EXAMPLE_ITEM = "@Easy/Bedwars:EXAMPLE_ITEM",
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
			image: "@Easy/Core/Shared/Resources/Images/ProfilePictures/Dom.png",
			// itemAssets: {
			// 	assetBundleId: BundleGroupNames.ItemSword,
			// },
		},
		config,
	);
}
