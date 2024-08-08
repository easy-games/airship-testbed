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

	public static HexToColor(hex: string, alpha = 1): Color {
		if (StringUtils.startsWith(hex, "0x")) {
			hex = hex.sub(2, hex.size());
		}
		if (!StringUtils.startsWith(hex, "#")) {
			hex = "#" + hex;
		}
		const [r, g, b] = string.match(hex, "^#?(%w%w)(%w%w)(%w%w)$");
		if (r !== undefined && g !== undefined && b !== undefined) {
			return new Color(tonumber(r, 16)! / 255, tonumber(g, 16)! / 255, tonumber(b, 16)! / 255, alpha);
		}
		warn("Invalid color hex: " + hex);
		return new Color(1, 1, 1, alpha);
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

	/**
	 * Convert an RGB color to an HSV Vector3
	 * @param color RBG color
	 * @returns Vector3 with Hue, Saturation, Value in a 0-1 range
	 */
	public static RgbToHsv(color: Color) {
		let r = color.r;
		let g = color.g;
		let b = color.b;

		let max = math.max(r, g, b);
		let min = math.min(r, g, b);
		let h = max;
		let s = max;
		let v = max;

		let d = max - min;
		s = max === 0 ? 0 : d / max;

		if (max === min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}

			h /= 6;
		}

		return new Vector3(h, s, v);
	}

	/**
	 * Convert an HSV Vector3 to a Color object
	 * @param color HSV color using 0-1 range
	 * @returns RGB Color
	 */
	public static HsvToRgb(hsvColor: Vector3) {
		let h = hsvColor.x;
		let s = hsvColor.y;
		let v = hsvColor.z;
		let r = 0;
		let g = 0;
		let b = 0;

		let i = math.floor(h * 6);
		let f = h * 6 - i;
		let p = v * (1 - s);
		let q = v * (1 - f * s);
		let t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}

		return new Color(r, g, b);
	}
}
