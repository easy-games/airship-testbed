import StringUtils from "../Types/StringUtil";

export class ColorUtil {
	/**
	 * Example return: "#121212"
	 * Note: return WILL include the "#"
	 */
	public static ColorToHex(color: Color): string {
		return string.format(
			"#%X%X%X",
			math.floor(color.r * 255),
			math.floor(color.g * 255),
			math.floor(color.b * 255),
		);
	}

	public static HexToColor(hex: string): Color {
		if (StringUtils.startsWith(hex, "0x")) {
			hex = hex.sub(2, hex.size());
		}
		if (!StringUtils.startsWith(hex, "#")) {
			hex = "#" + hex;
		}
		const [r, g, b] = string.match(hex, "^#?(%w%w)(%w%w)(%w%w)$");
		if (r !== undefined && g !== undefined && b !== undefined) {
			return new Color(tonumber(r, 16)! / 255, tonumber(g, 16)! / 255, tonumber(b, 16)! / 255, 1);
		}
		warn("Invalid color hex: " + hex);
		return new Color(1, 1, 1, 1);
	}

	public static ColoredText(color: Color, text: string): string {
		return `<color=${this.ColorToHex(color)}>${text}</color>`;
	}

	/**
	 *Returns a random color
	 **/
	public static GetRandomColor() {
		return this.GetRandomColorClampedRGB(0, 255, 0, 255, 0, 255);
	}

	/**
	 *Returns a random color where each channel is within the min max range
	 *Color is specified in a 0 - 255 range
	 **/
	public static GetRandomColorClamped(min: number, max: number) {
		return this.GetRandomColorClampedRGB(min, max, min, max, min, max);
	}

	/**
	 *Returns a random color where each channel is within the min max range
	 *Color is specified in a 0 - 255 range
	 **/
	public static GetRandomColorClampedRGB(
		minR: number,
		maxR: number,
		minG: number,
		maxG: number,
		minB: number,
		maxB: number,
	) {
		return new Color(math.random(minR, maxR) / 255, math.random(minG, maxG) / 255, math.random(minB, maxB) / 255);
	}
}
