/**
 * Set of utilities for working with `Array` types.
 */
export class ArrayUtil {
	/**
	 * Add arrayB to arrayA
	 * @param arrayA.
	 * @param arrayB.
	 * @returns A native Typescript array.
	 */
	public static Combine<T extends any[]>(arrayA: T, arrayB: T): T {
		arrayB.forEach((value) => {
			arrayA.push(value);
		});
		return arrayA;
	}

	/**
	 * Groups array values into a map by the specified key value
	 * @param array The array to mapify
	 * @param groupKey The key to use
	 */
	public static MapByKey<TValue extends object, TKey extends keyof TValue & string>(
		array: ReadonlyArray<TValue>,
		groupKey: TKey,
	): ReadonlyMap<TValue[TKey], TValue> {
		const map = new Map<TValue[TKey], TValue>();
		for (const value of array) {
			const applicator = value[groupKey];
			map.set(applicator, value);
		}
		return map;
	}
}
