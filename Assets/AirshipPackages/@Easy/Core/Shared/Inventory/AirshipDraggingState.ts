import Inventory from "./Inventory";
import { ItemStack } from "./ItemStack";

export type DraggingState = {
	inventory: Inventory;
	itemStack: ItemStack;
	slot: number;
	transform: RectTransform;
	consumed: boolean;
};

export type ClickPickupState = {
	inventory: Inventory;
	slot: number;
	itemType: string;
	amount: number;
	/**
	 * Reference to the item amount text component for updating amount of cloned item
	 */
	itemAmountText: TMP_Text;
	/**
	 * Using this as a workaround to prevent the item from being placed back on the same click
	 * Other option would be to get a pointer id, but that requires editing CanvasApi.OnPointerEvent to maybe give the pointer id which
	 * could change games that are using it.
	 */
	initialClickFlag?: boolean;
	/**
	 * Tracks if the item is a half stack
	 */
	halfStack?: boolean;
	/**
	 * Tracks if the item has been swapped with another item
	 */
	swapStack?: boolean;
	/**
	 * Set of slots the item has been dragged over during the drag operation
	 */
	draggedOverSlots?: Set<number>;
};
