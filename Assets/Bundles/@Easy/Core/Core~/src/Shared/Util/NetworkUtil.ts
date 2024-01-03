import { Bin } from "./Bin";
import { RunUtil } from "./RunUtil";
import { Signal } from "./Signal";
import { TimeUtil } from "./TimeUtil";

const waitingByName = new Map<string, NetworkObject>();

let managed: ManagedObjects = InstanceFinder.ClientManager.Objects;
if (RunUtil.IsServer()) {
	managed = InstanceFinder.ServerManager.Objects;
}
export const NetworkObjectAdded = new Signal<NetworkObject>();
managed.OnAddedToSpawnedEvent((nob) => {
	NetworkObjectAdded.debugGameObject = true;
	NetworkObjectAdded.Fire(nob);
	waitingByName.set(nob.gameObject.name, nob);
	// print("end of onAdded", nob.gameObject);
	// cleanup here
});

export class NetworkUtil {
	/**
	 * Replicate a `GameObject` to all clients. `GameObject` **MUST** have a `NetworkObject` component.
	 * If a `CollectionTag` `tag` is provided, the `CollectionManager` will capture,
	 * emit, and store replicated `GameObject`.
	 * @param gameObject The object being replicated.
	 * @param tag An optional tag to register `GameObject` with `CollectionManager`.
	 */
	public static Spawn(gameObject: GameObject): void {
		NetworkCore.Spawn(gameObject);
	}

	/**
	 * Replicate a `GameObject` to client `clientId`. `GameObject` **MUST** have a `NetworkObject` component.
	 * If a `CollectionTag` `tag` is provided, the `CollectionManager` will capture,
	 * emit, and store replicated `GameObject`.
	 * @param gameObject The object being replicated.
	 * @param clientId The client the object is being replicated to.
	 * @param tag An optional tag to register `GameObject` with `CollectionManager`.
	 */
	public static SpawnWithClientOwnership(gameObject: GameObject, clientId: number): void {
		NetworkCore.Spawn(gameObject, clientId);
	}

	/* Despawn a replicated `GameObject` on the client **and** server. */
	public static Despawn(gameObject: GameObject): void {
		const networkObjectId = gameObject.GetComponent<NetworkObject>().ObjectId;
		NetworkCore.Despawn(gameObject);
	}

	public static GetNetworkObject(objectId: number): NetworkObject | undefined {
		if (objectId === undefined) {
			return undefined;
		}
		if (RunUtil.IsClient()) {
			if (InstanceFinder.ClientManager.Objects.Spawned.ContainsKey(objectId)) {
				return InstanceFinder.ClientManager.Objects.Spawned.Get(objectId);
			} else {
				return undefined;
			}
		} else {
			if (InstanceFinder.ServerManager.Objects.Spawned.ContainsKey(objectId)) {
				return InstanceFinder.ServerManager.Objects.Spawned.Get(objectId);
			} else {
				return undefined;
			}
		}
	}

	/**
	 * Wait for (`timeout`) and fetch `NetworkObject` that corresponds to `objectId`.
	 * @param objectId Corresponds to a replicated `NetworkObject`.
	 * @param timeout How long in seconds to wait for `objectId` to exist before timing out.
	 * @returns `NetworkObject` that corresponds to `objectId`.
	 */
	public static WaitForNobIdTimeout(objectId: number, timeout: number): NetworkObject | undefined {
		/* Return NetworkObject if it already exists. */
		let nob = NetworkUtil.GetNetworkObject(objectId);
		if (nob) return nob;
		/* Return when exists or timeout after `timeout`. */
		let elapsed = 0;
		const bin = new Bin();
		bin.Add(
			NetworkObjectAdded.Connect((addedNob) => {
				if (addedNob.ObjectId === objectId) {
					nob = addedNob;
					bin.Clean();
				}
			}),
		);
		while (true) {
			task.wait();
			elapsed += TimeUtil.GetDeltaTime();
			if (nob) return nob;
			if (elapsed >= timeout) {
				bin.Clean();
				return undefined;
			}
		}
	}

	/**
	 * Wait for (`timeout`) and fetch `NetworkObject` that corresponds to `name`.
	 * @param objectId Corresponds to a replicated `NetworkObject`.
	 * @param timeout How long in seconds to wait for `name` to exist before timing out.
	 * @returns `NetworkObject` that corresponds to `name`.
	 */
	public static WaitForNobTimeout(name: string, timeout: number): NetworkObject | undefined {
		/* If `GameObject` with name already exists, return. */
		const gameObject = GameObject.Find(name);
		if (gameObject) {
			return gameObject.GetComponent<NetworkObject>();
		}
		/* Return when exists or timeout after `timeout`. */
		let elapsed = 0;
		while (true) {
			task.wait();
			elapsed += TimeUtil.GetDeltaTime();
			if (waitingByName.has(name)) return waitingByName.get(name)!;
			if (elapsed >= timeout) return undefined;
		}
	}

	/**
	 * Wait for and fetch `NetworkObject` that corresponds to `name`.
	 * @param objectId Corresponds to a replicated `NetworkObject`.
	 * @returns `NetworkObject` that corresponds to `name`.
	 */
	public static WaitForNob(name: string): NetworkObject {
		const gameObject = GameObject.Find(name);
		if (gameObject) {
			return gameObject.GetComponent<NetworkObject>();
		}
		while (true) {
			task.wait();
			if (waitingByName.has(name)) {
				return waitingByName.get(name)!;
			}
		}
	}

	/**
	 * Wait for and fetch `NetworkObject` that corresponds to `objectId`.
	 * @param objectId Corresponds to a replicated `NetworkObject`.
	 * @returns `NetworkObject` that corresponds to `objectId`.
	 */
	public static WaitForNobId(objectId: number): NetworkObject {
		let nob = NetworkUtil.GetNetworkObject(objectId);
		if (nob) {
			// print("found existing", nob.gameObject + ", nobId=" + objectId);
			return nob;
		}

		const bin = new Bin();
		// print("listening to event for nobId=" + objectId);
		bin.Add(
			NetworkObjectAdded.Connect((addedNob) => {
				if (addedNob.ObjectId === objectId) {
					nob = addedNob;
					bin.Clean();
				}
			}),
		);
		while (true) {
			// if (nob !== undefined) {
			// 	print("wait.before", (nob as NetworkObject).gameObject + ", nobId=" + objectId);
			// }
			task.wait();
			if (nob) {
				// print("wait.after", (nob as NetworkObject).gameObject + ", nobId=" + objectId);
				return nob;
			}
		}
	}
}
