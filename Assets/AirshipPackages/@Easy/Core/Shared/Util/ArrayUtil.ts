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
}
