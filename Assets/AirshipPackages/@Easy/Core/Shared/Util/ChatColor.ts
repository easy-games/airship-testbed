import { ColorUtil } from "./ColorUtil";
import { Theme } from "./Theme";

const HexColor = (color: Color, msg: string) => {
	return `<color=${ColorUtil.ColorToHex(color)}>${msg}</color>`;
};

export const ChatColor = {
	Color: (color: Color, msg: string) => HexColor(color, msg),
	Aqua: (msg: string) => HexColor(Theme.aqua, msg),
	Red: (msg: string) => HexColor(Theme.red, msg),
	Green: (msg: string) => HexColor(Theme.green, msg),
	Blue: (msg: string) => HexColor(Theme.blue, msg),
	White: (msg: string) => HexColor(Theme.white, msg),
	Gray: (msg: string) => HexColor(Theme.gray, msg),
	Yellow: (msg: string) => HexColor(Theme.yellow, msg),
	Bold: (msg: string) => `<b>${msg}</b>`,
	Italic: (msg: string) => `<i>${msg}</i>`,
	HexColor: (hexColor: string, msg: string) => HexColor(ColorUtil.HexToColor(hexColor), msg),
};
