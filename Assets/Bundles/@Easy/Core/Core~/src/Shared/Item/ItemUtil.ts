import Object from "@easy-games/unity-object-utils";
import { Signal } from "Shared/Util/Signal";
import { items } from "./ItemDefinitions";
import { ItemMeta } from "./ItemMeta";
import { ItemType } from "./ItemType";

export interface ItemRegistrationConfig {
	accessoryFolder?: string;
}

/**
 * Set of utilities for working with items.
 */
export class ItemUtil {
	public static readonly DefaultAccessoryCollectionPath =
		"@Easy/Core/Shared/Resources/Accessories/Kits/GothGirl/Kit_GothGirl_Collection.asset";
	public static readonly DefaultItemPath = "@Easy/Core/Shared/Resources/Accessories/missing_item.asset";

	private static readonly itemAccessories = new Map<ItemType, Accessory[]>();
	private static readonly blockIdToItemType = new Map<number, ItemType>();
	private static readonly itemIdToItemType = new Map<number, ItemType>();

	public static missingItemAccessory: Accessory;
	public static defaultKitAccessory: AccessoryCollection | undefined;

	private static itemTypes: ItemType[] = [];

	private static initialized = false;
	private static onInitialized = new Signal<void>();

	/**
	 * Called by Core.
	 */
	public static Initialize() {
		//Load default items
		ItemUtil.missingItemAccessory = AssetBridge.Instance.LoadAsset<Accessory>(ItemUtil.DefaultItemPath);
		ItemUtil.defaultKitAccessory = AssetBridge.Instance.LoadAsset<AccessoryCollection>(
			ItemUtil.DefaultAccessoryCollectionPath,
		);
		print("Init kit: " + ItemUtil.defaultKitAccessory?.name);

		let i = 0;
		for (const itemType of Object.keys(items)) {
			this.itemTypes.push(itemType);
			const itemMeta = ItemUtil.GetItemMeta(itemType);

			// Assign ID to each ItemType
			itemMeta.itemType = itemType;
			itemMeta.id = i;
			ItemUtil.itemIdToItemType.set(i, itemType);

			// Map Block types to items
			if (itemMeta.block?.blockId !== undefined) {
				ItemUtil.blockIdToItemType.set(itemMeta.block.blockId, itemType);
			}

			// Map items to accessories
			let accessoryPaths: string[] = [];
			if (itemMeta.accessoryPaths) {
				accessoryPaths = itemMeta.accessoryPaths;
			} else if (itemMeta.block?.blockId) {
				accessoryPaths = ["@Easy/Core/Shared/Resources/Accessories/block.asset"];
			}

			if (accessoryPaths.size() > 0) {
				const accessories: Accessory[] = [];
				ItemUtil.itemAccessories.set(itemType, accessories);

				for (const accessoryName of accessoryPaths) {
					let accessory = AssetBridge.Instance.LoadAssetIfExists<Accessory>(accessoryName);
					if (!accessory) {
						// warn("Couldn't find: " + accNameLower);
						continue;
					}

					// this.itemAccessories.set(itemType, accessory);
					accessories.push(accessory);
				}
			}

			i++;
		}
		this.initialized = true;
		this.onInitialized.Fire();
	}

	public static async WaitForInitialized(): Promise<void> {
		if (this.initialized) return;
		return new Promise<void>((resolve) => {
			this.onInitialized.Once(() => {
				resolve();
			});
		});
	}

	public static RegisterItem(
		itemType: ItemType,
		itemDefinition: Omit<ItemMeta, "id" | "itemType">,
		config?: ItemRegistrationConfig,
	) {
		if (config?.accessoryFolder) {
			if (itemDefinition.accessoryPaths) {
				itemDefinition.accessoryPaths = itemDefinition.accessoryPaths.map(
					(name) => config.accessoryFolder + "/" + name,
				);
			} else {
				itemDefinition.accessoryPaths = [config.accessoryFolder + "/" + itemType.lower() + ".asset"];
			}
		}
		items[itemType] = itemDefinition;
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
		return items[s as ItemType] !== undefined;
	}

	/**
	 * Find an `ItemType` from the given string, first trying direct then case-insensitive searching the items
	 * @param expression The string expression to search for
	 * @returns The `ItemType` (if found) - otherwise `undefined`.
	 */
	public static FindItemTypeFromString(expression: string): ItemType | undefined {
		const directId = items[expression as ItemType];
		if (directId) {
			return expression as ItemType;
		} else {
			// lowercase search
			for (const [key] of pairs(items)) {
				if (key.lower() === expression.lower()) {
					return key;
				}
			}
		}

		return undefined;
	}

	/**
	 * Fetch a render texture for a provided item.
	 * @param itemType An item.
	 * @returns Render texture that corresponds to item.
	 */
	public static GetItemRenderTexture(itemType: ItemType): Texture2D {
		const imageSrc = `${itemType.lower()}.png`;
		const path = `Client/Resources/Assets/ItemRenders/${imageSrc}`;
		return AssetBridge.Instance.LoadAsset<Texture2D>(path);
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

	public static ItemTypeComponents(itemType: ItemType): [scope: string, id: string] {
		const components = itemType.split(":");
		if (components.size() > 1) {
			return components as [string, string];
		} else {
			return ["", components[0]];
		}
	}

	public static GetItemTypes(): ItemType[] {
		return this.itemTypes;
	}
}
