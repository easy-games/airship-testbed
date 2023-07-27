import ObjectUtils from "@easy-games/unity-object-utils";
import { BlockPlaceClientSignal } from "Client/Signals/BlockPlaceClientSignal";
import { GameObjectUtil } from "Shared/GameObjectBridge";
import { ItemType } from "Shared/Item/ItemType";
import { RunUtil } from "Shared/Util/RunUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { ItemUtil } from "../../Item/ItemUtil";
import { Network } from "../../Network";
import { WorldAPI } from "../WorldAPI";

export class PrefabBlockManager {
	private static instance: PrefabBlockManager | undefined;
	public static Get(): PrefabBlockManager {
		if (this.instance === undefined) {
			this.instance = new PrefabBlockManager();
		}
		return this.instance;
	}

	private objectMap = new Map<Vector3, GameObject>();

	constructor() {
		const world = WorldAPI.GetMainWorld();
		world.OnVoxelPlaced.Connect((pos, voxel) => {
			const blockId = VoxelWorld.VoxelDataToBlockId(voxel);
			const itemType = ItemUtil.GetItemTypeFromBlockId(blockId);

			this.OnBlockDestroy(pos);

			if (itemType) {
				this.OnBlockPlace(pos, itemType);
			}
		});

		if (RunUtil.IsServer()) {
			const serverSignals = import("Server/ServerSignals").expect().ServerSignals;
			serverSignals.PlayerJoin.ConnectWithPriority(SignalPriority.HIGH, (event) => {
				Network.ServerToClient.SyncPrefabBlocks.Server.FireClient(
					event.player.clientId,
					ObjectUtils.keys(this.objectMap),
				);
			});
		} else {
			Network.ServerToClient.SyncPrefabBlocks.Client.OnServerEvent((blockPositions) => {
				world.WaitForFinishedReplicatingChunksFromServer().then(() => {
					print("received block pos count: " + blockPositions.size());
					for (const pos of blockPositions) {
						const block = world.GetBlockAt(pos);
						print(`block: pos=${pos} type=${block.itemType}`);
						if (block.itemType) {
							this.OnBlockPlace(pos, block.itemType);
							const clientSignals = import("Client/ClientSignals").expect().ClientSignals;
							clientSignals.BlockPlace.Fire(new BlockPlaceClientSignal(pos, block, undefined));
						}
					}
				});
			});
		}
	}

	public GetBlockGameObject(pos: Vector3): GameObject | undefined {
		return this.objectMap.get(pos);
	}

	private OnBlockPlace(pos: Vector3, itemType: ItemType): void {
		const itemMeta = ItemUtil.GetItemMeta(itemType);
		if (itemMeta.block?.prefab) {
			const prefab = AssetBridge.LoadAsset<Object>(
				`Shared/Resources/VoxelWorld/BlockPrefabs/${itemMeta.block.prefab.path}`,
			);
			const prefabGO = GameObjectUtil.InstantiateAt(prefab, pos, Quaternion.identity);
			this.objectMap.set(pos, prefabGO);

			if (itemMeta.block.prefab.childBlocks) {
				const world = WorldAPI.GetMainWorld();
				for (const vec of itemMeta.block.prefab.childBlocks) {
					const worldSpace = pos.add(vec);
					BlockDataAPI.SetChildOfParent(worldSpace, pos);
					world.PlaceBlockById(worldSpace, WorldAPI.ChildVoxelId);
				}
			}
		}
		if (itemMeta.block?.health !== undefined && RunUtil.IsServer()) {
			BlockDataAPI.SetBlockData(pos, "health", itemMeta.block.health);
		}
	}

	private OnBlockDestroy(pos: Vector3): void {
		const obj = this.objectMap.get(pos);
		if (obj) {
			let animatingOut = false;
			const ref = obj.GetComponent<GameObjectReferences>();
			if (ref) {
				const anim = ref.GetValue<Animation>("Animation", "OnDeath");
				if (anim) {
					animatingOut = true;
					anim.Play();
					GameObjectUtil.Destroy(obj, 5);
				}
			}
			if (!animatingOut) {
				GameObjectUtil.Destroy(obj);
			}
		}
		const world = WorldAPI.GetMainWorld();
		const childPositions = BlockDataAPI.GetChildrenBlockPos(pos);
		for (const childPos of childPositions) {
			world.PlaceBlockById(childPos, 0);
		}
	}
}
