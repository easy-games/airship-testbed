import { AccessoryMeta } from "./AccessoryMeta";
import { AccessoryType } from "./AccessoryType";

const accessories: {
	[key in AccessoryType]: AccessoryMeta;
} = {};

export function GetAccessoryMeta(accessoryType: AccessoryType): AccessoryMeta {
	return accessories[accessoryType];
}
