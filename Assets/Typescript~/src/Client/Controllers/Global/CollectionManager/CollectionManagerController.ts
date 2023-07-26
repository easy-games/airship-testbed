import { Controller, OnStart } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { ClientSignals } from "Client/ClientSignals";
import { Network } from "Shared/Network";
import { CollectionManager } from "Shared/Util/CollectionManager";
import { CollectionTag } from "Shared/Util/CollectionTag";
import { WaitForNobId } from "Shared/Util/NetworkUtil";

@Controller({ loadOrder: 0 })
export class CollectionManagerController implements OnStart {
	/** Client collection table. Associates collection tags with GameObjects. */
	private clientCollectionTable = new Map<string, Set<GameObject>>();

	constructor() {
		/* Sync up server replication table with client. */
		Network.ServerToClient.CollectionManagerState.Client.OnServerEvent((state) => {
			this.constructClientCollection(state);
		});

		/* Listen for tagged, replicated `GameObject` instatiation. */
		Network.ServerToClient.NetGameObjectReplicating.Client.OnServerEvent((networkObjectId, tag) => {
			print("wait.1");
			print(`[${tag}]: waiting for ${networkObjectId}`);
			print("wait.2");
			const replicatedGameObject = WaitForNobId(networkObjectId).gameObject;
			this.addGameObjectToTagSet(replicatedGameObject, tag);
		});

		/* Listen for local `GameObject` added to collection. */
		ClientSignals.CollectionManagerTagAdded.Connect(({ go, tag }) => {
			this.addGameObjectToTagSet(go, tag);
		});
	}

	OnStart(): void {}

	/** Constructs client collection table from server replication sync table. */
	private constructClientCollection(syncTable: Map<string, Set<number>>): void {
		const clientCollectionTable = new Map<string, Set<GameObject>>();
		/** Unpack server replication sync table and convert nobs to client-owned `GameObject`s. */
		ObjectUtils.keys(syncTable).forEach((collectionTag) => {
			const nobSet = syncTable.get(collectionTag);
			if (!nobSet) return;
			/* Create tag set. */
			const tagSet = new Set<GameObject>();
			nobSet.forEach((nob) => {
				const gameObject = WaitForNobId(nob).gameObject;
				tagSet.add(gameObject);
				/* Listen for destruction on construction. */
				this.listenForGameObjectDestruction(gameObject, collectionTag);
			});
			/* Merge set. */
			clientCollectionTable.set(collectionTag, tagSet);
		});
		this.clientCollectionTable = clientCollectionTable;
		/* Let `CollectionManager` know that table was replicated and reconstructed. */
		CollectionManager.replicationTableSynced = true;
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

	/**
	 * Adds `GameObject` `gameObject` to relevant `tag` tag set, OR creates tag set and adds `gameObject`.
	 * @param gameObject a `GameObject`.
	 * @param tag Tag to be added to `GameObject`.
	 */
	public addGameObjectToTagSet(gameObject: GameObject, tag: string): void {
		const tagSet = this.clientCollectionTable.get(tag);
		if (tagSet) {
			tagSet.add(gameObject);
		} else {
			this.clientCollectionTable.set(tag, new Set<GameObject>([gameObject]));
		}
		/* Listen for replicated GameObject despawning. */
		this.listenForGameObjectDestruction(gameObject, tag);
		/* Fire signal when `GameObject` is added to collection. */
		ClientSignals.GameObjectAddedToCollection.Fire({ go: gameObject, tag: tag });
	}

	/** Removes `GameObject` `gameObject` from relevant `tag` tag set. */
	public removeGameObjectFromTagSet(gameObject: GameObject, tag: string): void {
		const tagSet = this.clientCollectionTable.get(tag);
		if (!tagSet) return;
		if (tagSet.has(gameObject)) tagSet.delete(gameObject);
	}

	/**
	 * Fetches client-owned `GameObjects` by `CollectionTag`.
	 * @param tag A `CollectionTag` tag.
	 * @returns **ALL** `GameObjects` with `CollectionTag` tag.
	 */
	public getGameObjectsByTag(tag: CollectionTag): GameObject[] {
		const collectionGameObjects: GameObject[] = [];
		const tagSet = this.clientCollectionTable.get(tag);
		if (!tagSet) return collectionGameObjects;
		/* Convert set to array. */
		tagSet.forEach((gameObject) => collectionGameObjects.push(gameObject));
		return collectionGameObjects;
	}
}
