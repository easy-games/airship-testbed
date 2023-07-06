import { Network } from "Shared/Network";
import { RunUtil } from "Shared/Util/RunUtil";

export class VoxelDataAPI {
	private static voxelDataMap = new Map<Vector3, Map<string, unknown>>();

	/**
	 * Some prefab blocks take up more than 1x1x1 space (for example: a bed.)
	 * This map is a child fake block that points to the source block position.
	 */
	private static childVoxelRedirectMap = new Map<Vector3, Vector3>();
	private static parentToChildrenMap = new Map<Vector3, Set<Vector3>>();

	public static Init(): void {
		if (RunCore.IsClient()) {
			Network.ServerToClient.SetVoxelData.Client.OnServerEvent((voxelPos, key, data) => {
				this.SetVoxelData(voxelPos, key, data);
			});
		}
	}

	public static SetVoxelData(voxelPos: Vector3, key: string, data: unknown): void {
		let map: Map<string, unknown>;
		if (this.voxelDataMap.has(voxelPos)) {
			map = this.voxelDataMap.get(voxelPos)!;
		} else {
			map = new Map<string, unknown>();
			this.voxelDataMap.set(voxelPos, map);
		}
		map.set(key, data);
		if (RunUtil.IsServer()) {
			Network.ServerToClient.SetVoxelData.Server.FireAllClients(voxelPos, key, data);
		}
	}

	public static ClearVoxelData(voxelPos: Vector3): void {
		this.voxelDataMap.get(voxelPos)?.clear();
	}

	public static GetVoxelData<T>(voxelPos: Vector3, key: string): T | undefined {
		return this.voxelDataMap.get(voxelPos)?.get(key) as T | undefined;
	}

	public static GetParentVoxelPos(childPos: Vector3): Vector3 | undefined {
		return this.childVoxelRedirectMap.get(childPos);
	}

	public static GetChildrenVoxelPos(parentPos: Vector3): Set<Vector3> {
		return this.parentToChildrenMap.get(parentPos) ?? new Set<Vector3>();
	}

	public static SetChildOfParent(childPos: Vector3, parentPos: Vector3): void {
		this.childVoxelRedirectMap.set(childPos, parentPos);
		let set = this.parentToChildrenMap.get(parentPos);
		if (!set) {
			set = new Set<Vector3>();
			this.parentToChildrenMap.set(parentPos, set);
		}
		set.add(childPos);
	}
}
