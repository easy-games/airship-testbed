interface CSDictionary<Key, Value> {
	Keys: CSKeyCollection<Key>;
	Values: CSKeyCollection<Value>;
	Count: number;
	Get(key: Key): Value | undefined;
	ContainsKey(key: Key): boolean;
	ContainsValue(value: Value): boolean;
	Add(key: Key, value: Value): void;
	Clear(): void;
	Remove(key: Key): boolean;
}
