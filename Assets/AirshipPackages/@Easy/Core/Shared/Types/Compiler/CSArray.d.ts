interface CSArray<T> {
	Length: number;
	GetValue(index: number): T;
	SetValue(value: unknown, index: number): void;

	/**
	 * Creates a shallow copy of the Array.
	 */
	Clone(): CSArray<T>;

	/**
	 * Gets a value indicating whether the Array is read-only
	 */
	IsReadOnly: boolean;
	/**
	 * Gets the rank (number of dimensions) of the Array. For example, a one-dimensional array returns 1, a two-dimensional array returns 2, and so on.
	 */
	Rank: number;
}
