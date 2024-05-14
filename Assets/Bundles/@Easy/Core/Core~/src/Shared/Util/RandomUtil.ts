export class RandomUtil {
	/**
	 * Fetch a random element from an array.
	 * @param array An array.
	 * @returns A random element from `array`.
	 */
	public static FromArray<T>(array: T[]): T {
		let index = 0;
		if (array.size() > 1) math.random(0, array.size() - 1);
		return array[index];
	}
}
