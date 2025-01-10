export const enum AirshipDataStoreLockMode {
	Write = "WRITE",
	ReadWrite = "READ_WRITE",
}

/** Information about a data store key lock. */
export type AirshipDataStoreLockData =
	| {
			/** True if the key is locked, false otherwise. */
			locked: false;
	  }
	| {
			/** True if the key is locked, false otherwise. */
			locked: true;
			/** Additional data about the lock. */
			lockData: {
				/** The ID of the owner of the lock. This is a server ID */
				ownerId: string;
				/** The lock's mode. */
				mode: AirshipDataStoreLockMode;
				/** The time when the lock was created. */
				lockedAt: string;
				/** The last time the key was updated using this lock. */
				lastUpdated: string;
			};
	  };
