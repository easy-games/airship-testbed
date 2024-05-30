export class RandomUtil {
	/**
	 * Fetch a random element from an array.
	 * @param array An array.
	 * @returns A random element from `array`.
	 */
	public static FromArray<T>(array: T[]): T {
		if (array.size() <= 0) {
			error("Unable to fetch random element from empty array.");
		}
		let index = math.random(0, array.size() - 1);
		return array[index];
	}
}
