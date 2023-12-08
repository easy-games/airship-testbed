import Object from "@easy-games/unity-object-utils";
import { Signal } from "Shared/Util/Signal";
import { ItemTypeComponentsInternal, items } from "./ItemDefinitions";
import { ItemMeta } from "./ItemMeta";
import { ItemType } from "./ItemType";
import { includes } from "Shared/Types/StringUtil";

export interface ItemRegistrationConfig {
	accessoryFolder?: string;
}

/**
 * Set of utilities for working with items.
 */
export class ItemUtil {
	public static readonly DefaultAccessoryCollectionPath =
		"@Easy/Core/Shared/Resources/Accessories/LiveAvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
	public static readonly DefaultItemPath = "@Easy/Core/Shared/Resources/Accessories/missing_item.asset";

	private static readonly itemAccessories = new Map<ItemType, Accessory[]>();
	private static readonly avatarAccessories = new Map<AccessorySlot, Accessory[]>();
	private static readonly avatarSkinAccessories: AccessorySkin[] = [];
	private static readonly blockIdToItemType = new Map<string, ItemType>();
	private static readonly itemIdToItemType = new Map<number, ItemType>();

	public static missingItemAccessory: Accessory;
	public static defaultKitAccessory: AccessoryCollection | undefined;

	private static itemTypes: ItemType[] = [];
	private static implictItemTypeMap = new Map<string, ItemType>();

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
		//Load avatar accessories
		let avatarCollection = AssetBridge.Instance.LoadAsset<AvatarCollection>(
			"@Easy/Core/Shared/Resources/Accessories/AvatarItems/AllAvatarItems.asset",
		);
		for (let i = 0; i < avatarCollection.skinAccessories.Length; i++) {
			const element = avatarCollection.skinAccessories.GetValue(i);
			print("Found avatar skin item: " + element.DisplayName);
			this.avatarSkinAccessories.push(element);
		}
		for (let i = 0; i < avatarCollection.torsoAccessories.Length; i++) {
			const element = avatarCollection.torsoAccessories.GetValue(i);
			print("Found avatar item: " + element.DisplayName);
			this.AddAvailableAvatarItem(element.AccessorySlot, element);
		}

		//Load the defined items and map them to accessories
		for (const itemType of Object.keys(items)) {
			this.itemTypes.push(itemType);

			const [, item] = ItemUtil.GetItemTypeComponents(itemType);
			if (!this.implictItemTypeMap.get(item)) {
				this.implictItemTypeMap.set(item, itemType);
			}

			const itemMeta = ItemUtil.GetItemMeta(itemType);

			// Assign ID to each ItemType
			itemMeta.itemType = itemType;
			itemMeta.id = i;
			ItemUtil.itemIdToItemType.set(i, itemType);

			// Map Block types to items
			if (itemMeta.block?.blockId !== undefined) {
				this.blockIdToItemType.set(itemMeta.block.blockId, itemType);
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

	public static AddAvailableAvatarItem(slotType: AccessorySlot, item: Accessory) {
		let items = this.avatarAccessories.get(slotType);
		if (!items) {
			items = [];
		}
		items.push(item);
		this.avatarAccessories.set(slotType, items);
	}

	public static GetAllAvatarItems(slotType: AccessorySlot) {
		return this.avatarAccessories.get(slotType);
	}

	public static GetAllAvatarSkins() {}

	/**
	 * @deprecated
	 */
	public static GetItemTypeFromBlockId(blockId: number): ItemType | undefined {
		const WorldAPI = import("Shared/VoxelWorld/WorldAPI").expect().WorldAPI;
		const world = WorldAPI.GetMainWorld();
		if (!world) return undefined;

		const stringId = world.GetIdFromVoxelId(blockId);
		return this.GetItemTypeFromStringId(stringId);
	}

	public static GetItemTypeFromStringId(stringId: string): ItemType | undefined {
		return ItemUtil.blockIdToItemType.get(stringId);
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
	public static FindItemTypeFromExpression(expression: string): ItemType | undefined {
		if (items[expression as ItemType] !== undefined) return expression as ItemType;

		let [scope, id] = this.GetItemTypeComponents(expression as ItemType);
		if (scope === "") {
			const inferredItemType = this.implictItemTypeMap.get(id);
			if (inferredItemType) {
				return inferredItemType;
			}

			// Set default scope to core
			scope = `@Easy/Core`;
		}

		for (const [str, itemType] of pairs(this.implictItemTypeMap)) {
			if (str.lower() === expression.lower()) {
				return itemType;
			}
		}

		// 	// Explicit find
		for (const [key] of pairs(items)) {
			if (key.lower() === expression.lower()) {
				return key;
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
		const [, id] = this.GetItemTypeComponents(itemType);
		const imageSrc = `${id.lower()}.png`;
		const path = `Client/Resources/Assets/ItemRenders/${imageSrc}`;
		return AssetBridge.Instance.LoadAsset<Texture2D>(path);
	}
	/**
	 * Fetch an asset bundle item render path for a provided item.
	 * @param itemType An item.
	 * @returns Render path that corresponds to item.
	 */
	public static GetItemRenderPath(itemType: ItemType): string {
		const [, id] = this.GetItemTypeComponents(itemType);
		const imageSrc = `${id.lower()}.png`;
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

	/**
	 * Returns the component parts of an ItemType - the scope and the id
	 *
	 * E.g. `@Easy/Core:wood` returns [`"@Easy/Core"`, `"wood"`]
	 * @param itemType The item type to get the components of
	 * @returns The component prats of the item type string
	 */
	public static GetItemTypeComponents(itemType: ItemType): [scope: string, id: string] {
		return ItemTypeComponentsInternal(itemType);
	}

	public static GetItemTypes(): ItemType[] {
		return this.itemTypes;
	}
}
