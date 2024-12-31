import Inventory from "./Inventory";
import { ItemStack } from "./ItemStack";

export type DraggingState = {
	inventory: Inventory;
	itemStack: ItemStack;
	slot: number;
	transform: RectTransform;
	consumed: boolean;
};
