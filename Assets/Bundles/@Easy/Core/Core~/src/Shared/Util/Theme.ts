import { ColorUtil } from "./ColorUtil";

export class Theme {
	public static green = new Color(0.5, 1, 0.5, 1);
	public static red = new Color(1, 85 / 255, 85 / 255, 1);
	public static blue = new Color(0.6, 0.6, 1, 1);
	public static yellow = new Color(1, 1, 0.39);
	public static white = new Color(1, 1, 1, 1);
	public static black = new Color(0, 0, 0, 0);
	public static gray = new Color(0.63, 0.63, 0.63);
	public static aqua = new Color(86 / 255, 255 / 255, 255 / 255);
	public static pink = ColorUtil.HexToColor("#FF55FF");

	public static teamColor = {
		Green: new Color(0.5, 1, 0.5, 1),
		Red: new Color(1, 85 / 255, 85 / 255, 1),
		Blue: new Color(0.6, 0.6, 1, 1),
		Yellow: new Color(1, 1, 0.39),
	};
}
