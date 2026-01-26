import { ColorUtil } from "./ColorUtil";

export class Theme {
	public static green = new Color(0.5, 1, 0.5, 1);
	public static red = new Color(1, 85 / 255, 85 / 255, 1);
	public static blue = new Color(0.6, 0.6, 1, 1);
	public static yellow = new Color(1, 1, 0.39);
	public static white = new Color(1, 1, 1, 1);
	public static black = new Color(0, 0, 0, 1);
	public static gray = new Color(0.63, 0.63, 0.63);
	public static aqua = new Color(86 / 255, 255 / 255, 255 / 255);
	public static pink = ColorUtil.HexToColor("#FF55FF");

	public static primary = new Color(49 / 255, 115 / 255, 193 / 255, 1); // #3173C1
	public static uiDark = ColorUtil.HexToColor("#13161A");
	public static text = {
		primary: ColorUtil.HexToColor("#EDEFF2"),
		secondary: ColorUtil.HexToColor("#A8ADB8"),
	};

	public static statusIndicator = {
		online: ColorUtil.HexToColor("6AFF61"),
		inGame: ColorUtil.HexToColor("70D4FF"),
		offline: ColorUtil.HexToColor("9C9C9C"),
	};

	public static teamColor = {
		Green: new Color(0.5, 1, 0.5, 1),
		Red: new Color(1, 85 / 255, 85 / 255, 1),
		Blue: new Color(0.6, 0.6, 1, 1),
		Yellow: new Color(1, 1, 0.39),
	};
}
