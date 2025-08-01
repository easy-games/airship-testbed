import { Game } from "@Easy/Core/Shared/Game";

interface EditorCacheRecord<T = defined> {
	value: T;
	expiryThread?: thread;
}

export default class EditorCacheStore {
	private readonly db: Map<string, EditorCacheRecord> = new Map();

	public constructor() {
		if (!Game.IsEditor()) {
			throw error("Cannot create an instance of EditorCacheStore outside of the editor.");
		}
	}

	private typedGet<T>(key: string): EditorCacheRecord<T> | undefined {
		return this.db.get(key) as EditorCacheRecord<T> | undefined;
	}

	private ExpiryThreadFor(key: string, expireTimeSec: number): thread {
		return task.delayDetached(expireTimeSec, () => this.db.delete(key));
	}

	private ExpireEditorKey(key: string, expireTimeSec: number, set?: unknown) {
		const dbValue = this.db.get(key);

		if (dbValue === undefined) {
			if (set === undefined) {
				return;
			}

			this.db.set(key, {
				value: set as defined,
				expiryThread: this.ExpiryThreadFor(key, expireTimeSec),
			});
			return;
		}

		if (dbValue.expiryThread !== undefined) {
			task.cancel(dbValue.expiryThread);
		}

		this.db.set(key, {
			value: set ?? dbValue.value,
			expiryThread: this.ExpiryThreadFor(key, expireTimeSec),
		});
	}

	public GetKey<T>(key: string, expireTimeSec?: number): T | undefined {
		if (expireTimeSec !== undefined) {
			this.ExpireEditorKey(key, expireTimeSec);
		}
		return this.typedGet<T>(key)?.value;
	}

	public SetKey<T>(key: string, data: T, expireTimeSec: number): T | undefined {
		this.ExpireEditorKey(key, expireTimeSec, data);
		return data;
	}

	public DeleteKey<T = unknown>(key: string, returnValue: boolean = false): T | undefined {
		const dbValue = this.typedGet<T>(key);
		if (dbValue === undefined) {
			return undefined;
		}

		if (dbValue.expiryThread !== undefined) {
			task.cancel(dbValue.expiryThread);
		}

		this.db.delete(key);
		return returnValue ? dbValue.value : undefined;
	}

	public SetKeyTTL(key: string, expireTimeSec: number): number {
		this.ExpireEditorKey(key, expireTimeSec);
		return expireTimeSec;
	}
}
