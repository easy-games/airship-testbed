import { CoreNetwork } from "Shared/Network";
import { RunUtil } from "Shared/Util/RunUtil";

export class BlockDataAPI {
	private static blockDataMap = new Map<Vector3, Map<string, unknown>>();

	/**
	 * Some prefab blocks take up more than 1x1x1 space (for example: a bed.)
	 * This map is a child fake block that points to the source block position.
	 */
	private static childBlockRedirectMap = new Map<Vector3, Vector3>();
	private static parentToChildrenMap = new Map<Vector3, Set<Vector3>>();

	public static Init(): void {
		if (RunCore.IsClient()) {
			CoreNetwork.ServerToClient.SetBlockData.Client.OnServerEvent((blockPos, key, data) => {
				this.SetBlockData(blockPos, key, data);
			});
		} else {
			const serverSignals = import("Server/ServerSignals").expect().ServerSignals;
			serverSignals.PlayerJoin.Connect((event) => {
				for (const pair1 of this.blockDataMap) {
					for (const pair2 of pair1[1]) {
						CoreNetwork.ServerToClient.SetBlockData.Server.FireClient(
							event.player.clientId,
							pair1[0],
							pair2[0],
							pair2[1],
						);
					}
				}
			});
		}
	}

	public static SetBlockData(blockPos: Vector3, key: string, data: unknown): void {
		let map: Map<string, unknown>;
		if (this.blockDataMap.has(blockPos)) {
			map = this.blockDataMap.get(blockPos)!;
		} else {
			map = new Map<string, unknown>();
			this.blockDataMap.set(blockPos, map);
		}
		map.set(key, data);
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.SetBlockData.Server.FireAllClients(blockPos, key, data);
		}
	}

	public static ClearBlockData(blockPos: Vector3): void {
		this.blockDataMap.get(blockPos)?.clear();
	}

	public static GetBlockData<T>(blockPos: Vector3, key: string): T | undefined {
		return this.blockDataMap.get(blockPos)?.get(key) as T | undefined;
	}

	public static GetParentBlockPos(childPos: Vector3): Vector3 | undefined {
		return this.childBlockRedirectMap.get(childPos);
	}

	public static GetChildrenBlockPos(parentPos: Vector3): Set<Vector3> {
		return this.parentToChildrenMap.get(parentPos) ?? new Set<Vector3>();
	}

	public static SetChildOfParent(childPos: Vector3, parentPos: Vector3): void {
		this.childBlockRedirectMap.set(childPos, parentPos);
		let set = this.parentToChildrenMap.get(parentPos);
		if (!set) {
			set = new Set<Vector3>();
			this.parentToChildrenMap.set(parentPos, set);
		}
		set.add(childPos);
	}
}
