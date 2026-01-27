import { PointerButton } from "./../Util/CanvasAPI";
import Inventory from "./Inventory";
import { ItemStack } from "./ItemStack";

export type DraggingState = {
	inventory: Inventory;
	itemStack: ItemStack;
	slot: number;
	pointerButton: PointerButton;
};

export type ClickPickupState = {
	inventory: Inventory;
	slot: number;
	itemType: string;
	amount: number;
	/**
	 * Reference to the item amount text component for updating amount of cloned item
	 */
	itemAmountText?: TMP_Text;
	/**
	 * Reference to the item amount image component for updating amount of cloned item
	 */
	itemAmountImage?: Image;
	/**
	 * Reference to the item name text component
	 */
	itemNameText?: TMP_Text;
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
	 * Whether the drag operation was started with a right click
	 */
	isRightClickDrag?: boolean;
	/**
	 * Whether this is the first click drag that started the pickup
	 */
	isFirstClickDrag?: boolean;
};
