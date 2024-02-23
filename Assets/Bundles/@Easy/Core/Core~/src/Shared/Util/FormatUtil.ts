export class FormatUtil {
	/**
	 *  Converts a string formatted in either camelCase or PascalCase to Display Format.
	 *
	 * @param camelOrPascalString A string formatted in either camelCase or PascalCase.
	 * @returns A string in Display Format.
	 */
	public static ToDisplayFormat(camelOrPascalString: string): string {
		return camelOrPascalString.gsub(".%f[%l]", " %1")[0].gsub("%l%f[%u]", "%1 ")[0].gsub("^.", string.upper)[0];
	}
}
