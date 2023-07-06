/* eslint-disable @typescript-eslint/no-explicit-any */

/** Set of utilities for modifying and traversing sets. */
export class SetUtil {
	/**
	 * Converts a set to an array.
	 * @param set A set.
	 * @returns An array containing all members of the set `set`.
	 */
	public static ToArray<T extends defined>(set: Set<T>): T[] {
		const array: T[] = [];
		set.forEach((value) => array.push(value));
		return array;
	}
}
