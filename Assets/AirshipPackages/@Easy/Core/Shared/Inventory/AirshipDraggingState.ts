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
	halfStack?: boolean;
	swapStack?: boolean;
};
