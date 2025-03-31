import { MapUtil } from "./MapUtil";

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
	 * Will map an array to a map w/ the given key as the key of the map with the value being the first item that matches that key
	 *
	 * Note: If you want more than one value for each key mapped, use {@link GroupByKey}
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
			if (map.has(applicator)) continue;

			map.set(applicator, value);
		}
		return map;
	}

	/**
	 * Groups array values into a map by the specified key value
	 * @param array The array to mapify
	 * @param groupKey The key to use
	 */
	public static GroupByKey<TValue extends object, TKey extends keyof TValue & string>(
		array: ReadonlyArray<TValue>,
		groupKey: TKey,
	): ReadonlyMap<TValue[TKey], TValue[]> {
		const map = new Map<TValue[TKey], TValue[]>();
		for (const value of array) {
			const applicator = value[groupKey];
			const items = MapUtil.GetOrCreate(map, applicator, []);
			items.push(value);
		}
		return map;
	}
}
