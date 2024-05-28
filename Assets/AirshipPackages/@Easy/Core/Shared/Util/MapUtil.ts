type CreateMapEntryFactory<K, V> = (key: K, map: Map<K, V>) => V;

export class MapUtil {
	/**
	 * Will either get the value at key or if none exists it will set to provided default
	 *
	 * @returns new entry
	 */
	public static GetOrCreate<K, V extends defined>(map: Map<K, V>, key: K, initValue: V): V;
	public static GetOrCreate<K, V extends defined>(
		map: Map<K, V>,
		key: K,
		createValueFactory: CreateMapEntryFactory<K, V>,
	): V;
	public static GetOrCreate<K, V extends defined>(
		map: Map<K, V>,
		key: K,
		initValueOrFactory: V | CreateMapEntryFactory<K, V>,
	): V {
		const existing = map.get(key);
		if (existing) {
			return existing;
		}

		if (typeIs(initValueOrFactory, "function")) {
			const result = initValueOrFactory(key, map);
			map.set(key, result);
			return result;
		} else {
			map.set(key, initValueOrFactory);
			return initValueOrFactory;
		}
	}

	public static Values<T extends defined>(map: Map<unknown, T>): T[] {
		const result: T[] = [];
		for (const entry of map) {
			const val = entry[1];
			result.push(val);
		}
		return result;
	}

	public static Keys<T extends defined>(map: Map<T, unknown>): T[] {
		const result: T[] = [];
		for (const entry of map) {
			result.push(entry[0]);
		}
		return result;
	}

	public static Entries<T, K>(map: Map<T, K>): [T, K][] {
		const result: [T, K][] = [];
		for (const entry of map) {
			result.push([entry[0], entry[1]]);
		}
		return result;
	}
}
