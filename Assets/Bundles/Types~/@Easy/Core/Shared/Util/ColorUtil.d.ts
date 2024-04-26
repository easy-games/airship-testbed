export declare class ColorUtil {
    /**
     * Example return: "#121212"
     * Note: return WILL include the "#"
     */
    static ColorToHex(color: Color): string;
    static HexToColor(hex: string): Color;
    static ColoredText(color: Color, text: string): string;
    /**
     *Returns a random color
     **/
    static GetRandomColor(): Color;
    /**
     *Returns a random color where each channel is within the min max range
     *Color is specified in a 0 - 255 range
     **/
    static GetRandomColorClamped(min: number, max: number): Color;
    /**
     *Returns a random color where each channel is within the min max range
     *Color is specified in a 0 - 255 range
     **/
    static GetRandomColorClampedRGB(minR: number, maxR: number, minG: number, maxG: number, minB: number, maxB: number): Color;
}
