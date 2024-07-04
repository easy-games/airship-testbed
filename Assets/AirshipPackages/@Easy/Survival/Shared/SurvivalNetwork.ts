import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";

export const SurvivalNetwork = {
	ClientToServer: {
        // PlaceBlock: new RemoteEvent<[pos: Vector3, itemType: CoreItemType, rotation?: number]>("PlaceBlock"),
    },
	ServerToClient: {
        BlockPlace: new NetworkSignal<[pos: Vector3, voxel: number, entityId?: number]>("BlockPlace"),
		BlockGroupPlace: new NetworkSignal<[positions: Vector3[], voxels: number[], entityId?: number]>(
			"BlockGroupPlace",
		),
        // RevertBlockPlace: new RemoteEvent<[pos: Vector3]>("RevertBlockPlace"),
        SyncPrefabBlocks: new NetworkSignal<[blockPositions: Vector3[]]>("SyncPrefabBlocks"),
    },
}