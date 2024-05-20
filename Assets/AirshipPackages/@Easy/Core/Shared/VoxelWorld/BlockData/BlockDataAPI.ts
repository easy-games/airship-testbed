import Object from "@easy-games/unity-object-utils";
import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export enum CoreBlockMetaKeys {
	NO_BREAK = "noBreak",
	CURRENT_HEALTH = "health",
	CAN_TILL = "canTill",
}

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
			CoreNetwork.ServerToClient.SetBlockData.client.OnServerEvent((blockPos, key, data) => {
				this.SetBlockData(blockPos, key, data);
			});
			CoreNetwork.ServerToClient.SetBlockGroupCustomData.client.OnServerEvent((blockPos, key, data) => {
				this.SetBlockGroupCustomData(blockPos, key, data);
			});
			CoreNetwork.ServerToClient.SetBlockGroupSameData.client.OnServerEvent((blockPos, key, data) => {
				this.SetBlockGroupSameData(blockPos, key, data);
			});
		} else {
			Airship.players.onPlayerJoined.Connect((player) => {
				for (const pair1 of this.blockDataMap) {
					for (const pair2 of pair1[1]) {
						CoreNetwork.ServerToClient.SetBlockData.server.FireClient(player, pair1[0], pair2[0], pair2[1]);
					}
				}
			});
		}
	}

	public static SetBlockData(blockPos: Vector3, key: string, data: unknown, notifyClient = true): void {
		let map: Map<string, unknown>;
		if (this.blockDataMap.has(blockPos)) {
			map = this.blockDataMap.get(blockPos)!;
		} else {
			map = new Map<string, unknown>();
			this.blockDataMap.set(blockPos, map);
		}
		map.set(key, data);
		if (notifyClient && RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.SetBlockData.server.FireAllClients(blockPos, key, data);
		}
	}

	public static PrintAllBlockData() {
		for (const pos of Object.keys(this.blockDataMap)) {
			print("(" + pos.x + "," + pos.y + "," + pos.z + "):");
			const data = this.blockDataMap.get(pos)!;
			for (const key of Object.keys(data)) {
				print("    " + key + ": " + data.get(key));
			}
		}
	}

	public static SetBlockGroupCustomData(blockPositions: Vector3[], key: string, data: unknown[]): void {
		blockPositions.forEach((blockPos, index) => {
			this.SetBlockData(blockPos, key, data[index], false);
		});
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.SetBlockGroupCustomData.server.FireAllClients(blockPositions, key, data);
		}
	}

	public static SetBlockGroupSameData(blockPositions: Vector3[], key: string, data: unknown): void {
		blockPositions.forEach((blockPos, index) => {
			this.SetBlockData(blockPos, key, data, false);
		});
		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.SetBlockGroupSameData.server.FireAllClients(blockPositions, key, data);
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
