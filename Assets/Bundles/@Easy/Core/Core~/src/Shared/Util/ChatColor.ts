import { ColorUtil } from "./ColorUtil";
import { Theme } from "./Theme";

const HexColor = (color: Color, msg: string) => {
	return `<color=${ColorUtil.ColorToHex(color)}>${msg}</color>`;
};

export const ChatColor = {
	Color: (color: Color, msg: string) => HexColor(color, msg),
	Aqua: (msg: string) => HexColor(Theme.Aqua, msg),
	Red: (msg: string) => HexColor(Theme.Red, msg),
	Green: (msg: string) => HexColor(Theme.Green, msg),
	Blue: (msg: string) => HexColor(Theme.Blue, msg),
	White: (msg: string) => HexColor(Theme.White, msg),
	Gray: (msg: string) => HexColor(Theme.Gray, msg),
	Yellow: (msg: string) => HexColor(Theme.Yellow, msg),
	Bold: (msg: string) => `<b>${msg}</b>`,
	Italic: (msg: string) => `<i>${msg}</i>`,
};
