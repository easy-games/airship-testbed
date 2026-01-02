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
	clonedTransform: RectTransform;
	itemAmountText: TMP_Text;
	// Using this as a workaround to prevent the item from being placed back on the same click
	// Other option would be to get a pointer id, but that requires editing CanvasApi.OnPointerEvent to maybe give the pointer id which
	// could change games that are using it.
	initialClickFlag?: boolean;
	halfStack?: boolean;
	swapStack?: boolean;
};
