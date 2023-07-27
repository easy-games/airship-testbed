import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { Network } from "Shared/Network";
import { CollectionTag } from "Shared/Util/CollectionTag";

@Service({ loadOrder: 0 })
export class CollectionManagerService implements OnStart {
	/** Server collection table. Associates collection tags with GameObjects. */
	private serverCollectionTable = new Map<string, Set<GameObject>>();
	/** To replicate collection sync table. This is sent to players on _join_ to synchronize `CollectionManager` state. */
	private toReplicateCollectionTable = new Map<string, Set<number>>();

	OnStart(): void {
		/* On player join, send snapshot of replication table. */
		ServerSignals.PlayerJoin.Connect((event) => {
			Network.ServerToClient.CollectionManagerState.Server.FireClient(
				event.player.clientId,
				this.toReplicateCollectionTable,
			);
		});
		/* Listen for `GameObject` replication and manage sync table. */
		ServerSignals.NetGameObjectReplicating.Connect(({ nob, tag }) => {
			this.addNobToReplicationTagSet(nob, tag);
		});
		/* Listen for `GameObject` despawn and manage sync table. */
		ServerSignals.NetGameObjectDespawning.Connect(({ nob, tag }) => {
			this.removeNobFromReplicationTagSet(nob, tag);
		});

		/* Listen for local `GameObject` added to collection. */
		ServerSignals.CollectionManagerTagAdded.Connect(({ go, tag }) => {
			this.addGameObjectToTagSet(go, tag);
		});
	}

	/** Listen for `GameObject` `gameObject` destruction. */
	private listenForGameObjectDestruction(gameObject: GameObject, tag: string): void {
		/* Add `DestroyWatcher` component to _all_ tagged `GameObject`s. */
		if (gameObject.GetComponent<DestroyWatcher>() === undefined) {
			const componentRef = gameObject.AddComponent("DestroyWatcher") as DestroyWatcher;
			componentRef.OnDestroyedEvent(() => {
				this.removeGameObjectFromTagSet(gameObject, tag);
			});
		}
	}

	/** Adds networkObjectId `nob` to relevant `tag` tag set, OR creates tag set and adds `nob`. */
	private addNobToReplicationTagSet(nob: number, tag: string): void {
		const tagSet = this.toReplicateCollectionTable.get(tag);
		if (tagSet) {
			tagSet.add(nob);
		} else {
			this.toReplicateCollectionTable.set(tag, new Set<number>([nob]));
		}
	}

	/** Removes networkObjectId `nob` from relevant `tag` tag set. */
	private removeNobFromReplicationTagSet(nob: number, tag: string): void {
		const tagSet = this.toReplicateCollectionTable.get(tag);
		if (!tagSet) return;
		if (tagSet.has(nob)) tagSet.delete(nob);
	}

	/**
	 * Adds `GameObject` `gameObject` to relevant `tag` tag set, OR creates tag set and adds `gameObject`.
	 * @param gameObject a `GameObject`.
	 * @param tag Tag to be added to `GameObject`.
	 */
	public addGameObjectToTagSet(gameObject: GameObject, tag: string): void {
		const tagSet = this.serverCollectionTable.get(tag);
		if (tagSet) {
			tagSet.add(gameObject);
		} else {
			this.serverCollectionTable.set(tag, new Set<GameObject>([gameObject]));
		}
		/* Listen for GameObject destroying. */
		this.listenForGameObjectDestruction(gameObject, tag);
		/* Fire signal when `GameObject` is added to collection. */
		ServerSignals.GameObjectAddedToCollection.Fire({ go: gameObject, tag: tag });
	}

	/**
	 * Removes `GameObject` `gameObject` from relevant `tag` tag set.
	 * @param gameObject a `GameObject`.
	 * @param tag Tag to be removed to `GameObject`.
	 */
	public removeGameObjectFromTagSet(gameObject: GameObject, tag: string): void {
		const tagSet = this.serverCollectionTable.get(tag);
		if (!tagSet) return;
		if (tagSet.has(gameObject)) tagSet.delete(gameObject);
	}

	/** Returns server-owned `GameObject`s by `Tag` `tag`. */
	public getGameObjectsByTag(tag: CollectionTag): GameObject[] {
		const collectionGameObjects: GameObject[] = [];
		const tagSet = this.serverCollectionTable.get(tag);
		if (!tagSet) return collectionGameObjects;
		/* Convert set to array. */
		tagSet.forEach((gameObject) => collectionGameObjects.push(gameObject));
		return collectionGameObjects;
	}
}
