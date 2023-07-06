import { ItemType } from "./ItemType";

/**
 * Set of utilities for working with items.
 */
export class ItemUtil {
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
