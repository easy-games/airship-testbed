import { AirshipDataStoreLockInfo, AirshipDataStoreLockMode } from "@Easy/Core/Shared/Airship/Types/AirshipDataStore";
import { Game } from "@Easy/Core/Shared/Game";

interface EditorDataStoreLockRecord {
	mode: AirshipDataStoreLockMode;
	lockedAt: string;
	lastUpdated: string;
}

interface EditorDataStoreRecord<T = object> {
	value: T;
	lockedLocally?: EditorDataStoreLockRecord | undefined;
}

export default class EditorDataStore {
	private readonly db: Map<string, EditorDataStoreRecord> = new Map();

	public constructor() {
		if (!Game.IsEditor()) {
			throw error("Cannot create an instance of EditorDataStore outside of the editor.");
		}
	}

	private typedGet<T>(key: string): EditorDataStoreRecord<T> | undefined {
		return this.db.get(key) as EditorDataStoreRecord<T> | undefined;
	}

	private LockKeyInEditor(key: string, lock: AirshipDataStoreLockMode | undefined): boolean {
		const currentData = this.db.get(key);
		if (currentData === undefined) {
			return false;
		}

		let lastUpdated: string = DateTime.now().ToISO();
		let lockedAt: string;
		if (currentData.lockedLocally === undefined) {
			lockedAt = lastUpdated;
		} else {
			lockedAt = currentData.lockedLocally.lockedAt;
		}

		if (lock === undefined) {
			this.db.set(key, { lockedLocally: undefined, value: currentData.value });
		} else {
			this.db.set(key, { lockedLocally: { mode: lock, lockedAt, lastUpdated }, value: currentData.value });
		}

		return true;
	}

	public GetKey<T extends object>(key: string): T | undefined {
		return this.typedGet<T>(key)?.value;
	}

	public SetKey<T extends object>(key: string, data: T): T {
		const dbValue = this.db.get(key);
		if (!dbValue) {
			this.db.set(key, { value: data });
			return data;
		}
		dbValue.value = data;
		return data;
	}

	public async GetAndSetKey<T extends object>(
		key: string,
		callback: (record?: T) => Promise<T | undefined> | T | undefined,
	): Promise<T | undefined> {
		const dbValue = this.typedGet<T>(key);
		const newData = await callback(dbValue?.value);

		if (newData === undefined) {
			return dbValue?.value;
		}

		this.db.set(key, { value: newData, lockedLocally: dbValue?.lockedLocally });
		return newData;
	}

	public DeleteKey<T extends object>(key: string): T | undefined {
		const dbValue = this.typedGet<T>(key);
		this.db.delete(key);
		return dbValue?.value;
	}

	public async GetAndDeleteKey<T extends object>(
		key: string,
		callback: (record: T) => Promise<boolean> | boolean,
	): Promise<T | undefined> {
		const dbValue = this.typedGet<T>(key);

		if (dbValue === undefined) {
			return undefined;
		}

		const shouldDelete = await callback(dbValue.value);

		if (shouldDelete) {
			this.db.delete(key);
		}

		return dbValue.value;
	}

	public LockKeyOrStealSafely(key: string, mode: AirshipDataStoreLockMode = "READ_WRITE"): boolean {
		return this.LockKeyInEditor(key, mode);
	}

	public LockKey(key: string, mode: AirshipDataStoreLockMode = "READ_WRITE"): boolean {
		return this.LockKeyInEditor(key, mode);
	}

	public UnlockKey(key: string): boolean {
		return this.LockKeyInEditor(key, undefined);
	}

	public GetLockDataForKey(key: string): AirshipDataStoreLockInfo {
		const dbValue = this.db.get(key);

		if (dbValue === undefined || dbValue.lockedLocally === undefined) {
			return { locked: false };
		}

		return {
			locked: true,
			lockData: {
				ownerId: "editor",
				...dbValue.lockedLocally,
			},
		};
	}
}
