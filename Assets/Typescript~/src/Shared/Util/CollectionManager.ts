import { Bin } from "./Bin";
import { CollectionTag } from "./CollectionTag";
import { RunUtil } from "./RunUtil";
import { Task } from "./Task";

/** How often to check if server-owned replication sync table has been reconstructed on client.  */
const REPLICATION_CHECK_INTERVAL = 0.1;

export class CollectionManager {
	/** Whether or not the server-owned replication sync table has been reconstructed on client. */
	public static replicationTableSynced = false;

	/**
	 * Runs `gameObjectCallback` on all existing and any new `GameObject`s with provided `CollectionTag` `collectionTag`.
	 * @param collectionTag A `CollectionTag` tag.
	 * @param gameObjectCallback Callback that runs on `GameObject`s that have `CollectionTag` `collectionTag`.
	 * @returns `Bin` to cleanup watch connection. Call `Bin.Clean()` to disconnect.
	 */
	public static WatchCollectionTag(
		collectionTag: CollectionTag,
		gameObjectCallback: (gameObject: GameObject) => void,
	): Bin {
		const watchBin = new Bin();
		Task.Spawn(() => {
			if (RunUtil.IsServer()) {
				import("Server/ServerSignals").then((serverSignalsRef) => {
					const gameObjectAddedSignal = serverSignalsRef.ServerSignals.GameObjectAddedToCollection;
					const existingGameObjects = CollectionManager.GetTagged(collectionTag);
					/* Execute `gameObjectCallback` on ALL existing `GameObject`s with `collectionTag`. */
					existingGameObjects.forEach((go) => gameObjectCallback(go));
					/* Execute `gameObjectCallback` on ALL new `GameObject`s with `collectionTag`. */
					watchBin.Add(
						gameObjectAddedSignal.Connect((event) => {
							if (event.tag === collectionTag) gameObjectCallback(event.go);
						}),
					);
				});
			} else if (RunUtil.IsClient()) {
				import("Client/ClientSignals").then((clientSignalsRef) => {
					/* Wait until replication table has been synced and constructed on client. */
					while (!this.replicationTableSynced) wait(REPLICATION_CHECK_INTERVAL);
					const gameObjectAddedSignal = clientSignalsRef.ClientSignals.GameObjectAddedToCollection;
					const existingGameObjects = CollectionManager.GetTagged(collectionTag);
					/* Execute `gameObjectCallback` on ALL existing `GameObject`s with `collectionTag`. */
					existingGameObjects.forEach((go) => gameObjectCallback(go));
					/* Execute `gameObjectCallback` on ALL new `GameObject`s with `collectionTag`. */
					watchBin.Add(
						gameObjectAddedSignal.Connect((event) => {
							if (event.tag === collectionTag) gameObjectCallback(event.go);
						}),
					);
				});
			}
		});
		/* Return Bin for listener cleanup. */
		return watchBin;
	}

	/**
	 * Fetch tagged `GameObject`s based on runtime environment.
	 * @param collectionTag A `CollectionTag` tag.
	 * @returns All `GameObject`s tagged with `CollectionTag` `collectionTag`.
	 */
	public static GetTagged(collectionTag: CollectionTag): GameObject[] {
		/* Wrap fetch in promise to conditionally fetch `GameObject`s based on runtime. */
		const fetchPromise = new Promise((resolve) => {
			if (RunUtil.IsServer()) {
				import("Server/Services/Global/CollectionManager/CollectionManagerHelper").then(
					(collectionManagerRef) => {
						const collectionManager = collectionManagerRef.FetchDependency();
						const gameObjects = collectionManager.getGameObjectsByTag(collectionTag);
						resolve(gameObjects);
					},
				);
			} else if (RunUtil.IsClient()) {
				import("Client/Controllers/Global/CollectionManager/CollectionManagerHelper").then(
					(collectionManagerRef) => {
						const collectionManager = collectionManagerRef.FetchDependency();
						const gameObjects = collectionManager.getGameObjectsByTag(collectionTag);
						resolve(gameObjects);
					},
				);
			}
		});
		/* This **DOES** yield but should be effectively instant. */
		return fetchPromise.expect() as GameObject[];
	}

	/**
	 * Add a `CollectionTag` to a `GameObject` based on runtime.
	 * @param gameObject A `GameObject` to tag.
	 * @param collectionTag A `CollectionTag` tag.
	 */
	public static AddTag(gameObject: GameObject, collectionTag: CollectionTag): void {
		if (RunUtil.IsServer()) {
			import("Server/Services/Global/CollectionManager/CollectionManagerHelper").then((collectionManagerRef) => {
				const collectionManager = collectionManagerRef.FetchDependency();
				collectionManager.addGameObjectToTagSet(gameObject, collectionTag);
			});
		} else if (RunUtil.IsClient()) {
			import("Client/Controllers/Global/CollectionManager/CollectionManagerHelper").then(
				(collectionManagerRef) => {
					const collectionManager = collectionManagerRef.FetchDependency();
					collectionManager.addGameObjectToTagSet(gameObject, collectionTag);
				},
			);
		}
	}

	/**
	 * Remove a `CollectionTag` from a `GameObject` based on runtime.
	 * @param gameObject A `GameObject` to tag.
	 * @param collectionTag A `CollectionTag` tag.
	 */
	public static RemoveTag(gameObject: GameObject, collectionTag: CollectionTag): void {
		if (RunUtil.IsServer()) {
			import("Server/Services/Global/CollectionManager/CollectionManagerHelper").then((collectionManagerRef) => {
				const collectionManager = collectionManagerRef.FetchDependency();
				collectionManager.removeGameObjectFromTagSet(gameObject, collectionTag);
			});
		} else if (RunUtil.IsClient()) {
			import("Client/Controllers/Global/CollectionManager/CollectionManagerHelper").then(
				(collectionManagerRef) => {
					const collectionManager = collectionManagerRef.FetchDependency();
					collectionManager.removeGameObjectFromTagSet(gameObject, collectionTag);
				},
			);
		}
	}
}
