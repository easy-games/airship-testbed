import Object from "@easy-games/unity-object-utils";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { ItemDef } from "./ItemDefinitionTypes";
import { CoreItemDefinitions, ItemTypeComponentsInternal } from "./ItemDefinitions";

export interface ItemRegistrationConfig {
	accessoryFolder?: string;
}

/**
 * Set of utilities for working with items.
 */
export class ItemUtil {
	public static readonly defaultItemPath = "@Easy/Core/Shared/Resources/Accessories/missing_item.prefab";

	private static readonly itemAccessories = new Map<string, AccessoryComponent[]>();
	private static readonly blockIdToItemType = new Map<string, string>();
	private static readonly itemIdToItemType = new Map<number, string>();
	private static runtimeIdCounter = 0;

	public static missingItemAccessory: AccessoryComponent;

	private static itemTypes: string[] = [];
	private static implictItemTypeMap = new Map<string, string>();

	private static initialized = false;
	private static onInitialized = new Signal<void>();

	/**
	 * Called by Core.
	 */
	public static Initialize() {
		//Load default items
		ItemUtil.missingItemAccessory = AssetBridge.Instance.LoadAsset<AccessoryComponent>(ItemUtil.defaultItemPath);

		//Load the defined items and map them to accessories
		for (const itemType of Object.keys(CoreItemDefinitions)) {
			this.RegisterItem(itemType as string, CoreItemDefinitions[itemType]);
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
		itemType: string,
		itemDefinition: Omit<ItemDef, "id" | "itemType">,
		config?: ItemRegistrationConfig,
	) {
		if (config?.accessoryFolder) {
			if (itemDefinition.accessoryPaths) {
				itemDefinition.accessoryPaths = itemDefinition.accessoryPaths.map(
					(name) => config.accessoryFolder + "/" + name,
				);
			} else {
				itemDefinition.accessoryPaths = [config.accessoryFolder + "/" + itemType.lower() + ".prefab"];
			}
		}
		CoreItemDefinitions[itemType] = itemDefinition;

		/********/

		this.itemTypes.push(itemType);

		const [, item] = ItemUtil.GetItemTypeComponents(itemType);
		if (!this.implictItemTypeMap.get(item)) {
			this.implictItemTypeMap.set(item, itemType);
		}

		const itemMeta = ItemUtil.GetItemDef(itemType);

		// Assign ID to each ItemType
		itemMeta.itemType = itemType;
		itemMeta.id = this.runtimeIdCounter;
		ItemUtil.itemIdToItemType.set(this.runtimeIdCounter, itemType);

		// Map Block types to items
		if (itemMeta.block?.blockId !== undefined) {
			this.blockIdToItemType.set(itemMeta.block.blockId, itemType);
		}

		// Map items to accessories
		let accessoryPaths: string[] = [];
		if (itemMeta.accessoryPaths) {
			accessoryPaths = itemMeta.accessoryPaths;
		} else if (itemMeta.block?.blockId) {
			accessoryPaths = ["@Easy/Core/Shared/Resources/Accessories/block.prefab"];
		}

		if (accessoryPaths.size() > 0) {
			const accessories: AccessoryComponent[] = [];
			ItemUtil.itemAccessories.set(itemType, accessories);

			for (const accessoryName of accessoryPaths) {
				let accessory = AssetBridge.Instance.LoadAssetIfExists<GameObject>(accessoryName);
				if (!accessory) {
					continue;
				}

				const accessoryComponent = accessory.GetComponent<AccessoryComponent>();
				if (!accessoryComponent) {
					error("Missing AccessoryComponent on game object prefab");
				}
				accessories.push(accessoryComponent);
			}
		}
		this.runtimeIdCounter++;
	}

	/**
	 * @deprecated
	 */
	public static GetItemTypeFromBlockId(blockId: number): string | undefined {
		const WorldAPI = import("@Easy/Core/Shared/VoxelWorld/WorldAPI").expect().WorldAPI;
		const world = WorldAPI.GetMainWorld();
		if (!world) return undefined;

		const stringId = world.GetIdFromVoxelId(blockId);
		return this.GetItemTypeFromStringId(stringId);
	}

	public static GetItemTypeFromStringId(stringId: string): string | undefined {
		return ItemUtil.blockIdToItemType.get(stringId);
	}

	public static GetItemTypeFromItemId(itemId: number): string | undefined {
		return ItemUtil.itemIdToItemType.get(itemId);
	}

	public static GetItemDef(itemType: string): ItemDef {
		const val = CoreItemDefinitions[itemType] as ItemDef;
		if (val === undefined) {
			error("FATAL: ItemType had no ItemMeta: " + itemType);
		}
		return val;
	}

	public static GetFirstAccessoryForItemType(itemType: string): AccessoryComponent {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories[0];

		return ItemUtil.missingItemAccessory;
	}

	public static GetAccessoriesForItemType(itemType: string): Readonly<AccessoryComponent[]> {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories;

		return [ItemUtil.missingItemAccessory];
	}

	public static IsItemType(s: string): boolean {
		return CoreItemDefinitions[s as string] !== undefined;
	}

	/**
	 * Find an `ItemType` from the given string, first trying direct then case-insensitive searching the items
	 * @param expression The string expression to search for
	 * @returns The `ItemType` (if found) - otherwise `undefined`.
	 */
	public static FindItemTypeFromExpression(expression: string): string | undefined {
		if (CoreItemDefinitions[expression] !== undefined) return expression as string;

		let [scope, id] = this.GetItemTypeComponents(expression as string);
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
		for (const [key] of pairs(CoreItemDefinitions)) {
			if ((key as string).lower() === expression.lower()) {
				return key as string;
			}
		}

		return undefined;
	}

	/**
	 * Checks whether or not an item is a resource.
	 * @param itemType An item.
	 * @returns Whether or not item is a resource.
	 */
	// public static IsResource(itemType: ItemType): boolean {
	// 	return itemType === ItemType.IRON || itemType === ItemType.DIAMOND || itemType === ItemType.EMERALD;
	// }

	/**
	 * Returns the component parts of an ItemType - the scope and the id
	 *
	 * E.g. `@Easy/Core:wood` returns [`"@Easy/Core"`, `"wood"`]
	 * @param itemType The item type to get the components of
	 * @returns The component prats of the item type string
	 */
	public static GetItemTypeComponents(itemType: string): [scope: string, id: string] {
		return ItemTypeComponentsInternal(itemType);
	}

	public static GetItemTypes(): string[] {
		return this.itemTypes;
	}
}
