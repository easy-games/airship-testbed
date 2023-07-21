import Object from "@easy-games/unity-object-utils";
import { ItemType } from "./ItemType";
import { ItemMeta } from "./ItemMeta";
import { items } from "./ItemDefinitions";

/**
 * Set of utilities for working with items.
 */
export class ItemUtil {
	public static readonly DefaultKitPath = "Shared/Resources/Accessories/Kits/Whim/WhimKit.asset";
	public static readonly DefaultItemPath = "Shared/Resources/Accessories/missing_item.asset";

	private static readonly itemAccessories = new Map<ItemType, Accessory[]>();
	private static readonly blockIdToItemType = new Map<number, ItemType>();
	private static readonly itemIdToItemType = new Map<number, ItemType>();

	public static missingItemAccessory: Accessory;
	public static defaultKitAccessory: AccessoryKit | undefined;

	public static Initialize() {
		//Load default items
		ItemUtil.missingItemAccessory = AssetBridge.LoadAsset<Accessory>(ItemUtil.DefaultItemPath);
		ItemUtil.defaultKitAccessory = AssetBridge.LoadAssetIfExists<AccessoryKit>(ItemUtil.DefaultKitPath);

		let i = 0;
		for (const itemType of Object.values(ItemType)) {
			const itemMeta = ItemUtil.GetItemMeta(itemType);

			// Assign ID to each ItemType
			itemMeta.ItemType = itemType;
			itemMeta.ID = i;
			ItemUtil.itemIdToItemType.set(i, itemType);

			// Map Block types to items
			if (itemMeta.block?.blockId !== undefined) {
				ItemUtil.blockIdToItemType.set(itemMeta.block.blockId, itemType);
			}

			// Map items to accessories
			let accessoryNames: string[] = [itemType];
			if (itemMeta.AccessoryNames) {
				accessoryNames = itemMeta.AccessoryNames;
			} else if (itemMeta.block?.blockId) {
				accessoryNames = ["BLOCK"];
			}

			if (accessoryNames.size() > 0) {
				const accessories: Accessory[] = [];
				ItemUtil.itemAccessories.set(itemType, accessories);

				for (const accessoryName of accessoryNames) {
					let accNameLower = accessoryName.lower();
					let accessory = AssetBridge.LoadAssetIfExists<Accessory>(
						`Shared/Resources/Accessories/${accNameLower}.asset`,
					);
					if (!accessory) {
						warn("Couldn't find: " + accNameLower);
						continue;
					}

					// this.itemAccessories.set(itemType, accessory);
					accessories.push(accessory);
				}
			}

			i++;
		}
	}

	public static GetItemTypeFromBlockId(blockId: number): ItemType | undefined {
		return ItemUtil.blockIdToItemType.get(blockId);
	}

	public static GetItemTypeFromItemId(itemId: number): ItemType | undefined {
		return ItemUtil.itemIdToItemType.get(itemId);
	}

	public static GetItemMeta(itemType: ItemType): ItemMeta {
		const val = items[itemType] as ItemMeta;
		if (val === undefined) {
			error("FATAL: ItemType had no ItemMeta: " + itemType);
		}
		return val;
	}

	public static GetFirstAccessoryForItemType(itemType: ItemType): Accessory {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories[0];

		return ItemUtil.missingItemAccessory;
	}

	public static GetAccessoriesForItemType(itemType: ItemType): Readonly<Accessory[]> {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories;

		return [ItemUtil.missingItemAccessory];
	}

	public static IsItemType(s: string): boolean {
		return Object.values(ItemType).includes(s as ItemType);
	}

	/**
	 * Fetch a render texture for a provided item.
	 * @param itemType An item.
	 * @returns Render texture that corresponds to item.
	 */
	public static GetItemRenderTexture(itemType: ItemType): Texture2D {
		const imageSrc = `${itemType.lower()}.png`;
		const path = `Client/Resources/Assets/ItemRenders/${imageSrc}`;
		return AssetBridge.LoadAsset<Texture2D>(path);
	}
	/**
	 * Fetch an asset bundle item render path for a provided item.
	 * @param itemType An item.
	 * @returns Render path that corresponds to item.
	 */
	public static GetItemRenderPath(itemType: ItemType): string {
		const imageSrc = `${itemType.lower()}.png`;
		return `Client/Resources/Assets/ItemRenders/${imageSrc}`;
	}

	/**
	 * Checks whether or not an item is a resource.
	 * @param itemType An item.
	 * @returns Whether or not item is a resource.
	 */
	public static IsResource(itemType: ItemType): boolean {
		return itemType === ItemType.IRON || itemType === ItemType.DIAMOND || itemType === ItemType.EMERALD;
	}
}
