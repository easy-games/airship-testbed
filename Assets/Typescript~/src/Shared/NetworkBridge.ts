import { Network } from "./Network";
import { CollectionTag } from "./Util/CollectionTag";
import { RunUtil } from "./Util/RunUtil";

/** Wrapper around `NetworkCore` to allow for easy capturing of replicated GameObjects. */
export class NetworkUtil {
	/** Tag lookup table for tag based despawns. Mapping of `networkObjectId` to `CollectionTag`. */
	private static tagLookup = new Map<number, CollectionTag>();

	/**
	 * Replicate a `GameObject` to all clients. `GameObject` **MUST** have a `NetworkObject` component.
	 * If a `CollectionTag` `tag` is provided, the `CollectionManager` will capture,
	 * emit, and store replicated `GameObject`.
	 * @param gameObject The object being replicated.
	 * @param tag An optional tag to register `GameObject` with `CollectionManager`.
	 */
	public static Spawn(gameObject: GameObject, tag?: CollectionTag): void {
		NetworkCore.Spawn(gameObject);
		/* If tagged, notify _all_ clients of replicating GO. */
		if (tag) {
			/* Map GameObject to tag for lookup on despawn. */
			const networkObjectId = gameObject.GetComponent<NetworkObject>().ObjectId;
			/* Insert into tag lookup table to find tag on despawn. */
			NetworkUtil.tagLookup.set(networkObjectId, tag);
			if (RunUtil.IsServer()) {
				import("Server/ServerSignals").then((serverSignalsRef) => {
					const netGameObjectReplicatingSignal = serverSignalsRef.ServerSignals.NetGameObjectReplicating;
					Network.ServerToClient.NetGameObjectReplicating.Server.FireAllClients(networkObjectId, tag);
					netGameObjectReplicatingSignal.Fire({ nob: networkObjectId, tag: tag });
				});
			}
		}
	}

	/**
	 * Replicate a `GameObject` to client `clientId`. `GameObject` **MUST** have a `NetworkObject` component.
	 * If a `CollectionTag` `tag` is provided, the `CollectionManager` will capture,
	 * emit, and store replicated `GameObject`.
	 * @param gameObject The object being replicated.
	 * @param clientId The client the object is being replicated to.
	 * @param tag An optional tag to register `GameObject` with `CollectionManager`.
	 */
	public static SpawnWithClientOwnership(gameObject: GameObject, clientId: number, tag?: CollectionTag): void {
		NetworkCore.Spawn(gameObject, clientId);
		/* If tagged, notify `clientId` of replicating GO. */
		if (tag) {
			const networkObjectId = gameObject.GetComponent<NetworkObject>().ObjectId;
			if (RunUtil.IsServer()) {
				Network.ServerToClient.NetGameObjectReplicating.Server.FireClient(clientId, networkObjectId, tag);
			}
		}
	}

	/* Despawn a replicated `GameObject` on the client **and** server. */
	public static Despawn(gameObject: GameObject): void {
		const networkObjectId = gameObject.GetComponent<NetworkObject>().ObjectId;
		const tag = NetworkUtil.tagLookup.get(networkObjectId);
		/* If tagged, remove from lookup table and fire despawn notifier signal. */
		if (tag) {
			NetworkUtil.tagLookup.delete(networkObjectId);
			if (RunUtil.IsServer()) {
				import("Server/ServerSignals").then((serverSignalsRef) => {
					const netGameObjectDespawning = serverSignalsRef.ServerSignals.NetGameObjectDespawning;
					netGameObjectDespawning.Fire({ nob: networkObjectId, tag: tag });
				});
			}
		}
		NetworkCore.Despawn(gameObject);
	}
}
