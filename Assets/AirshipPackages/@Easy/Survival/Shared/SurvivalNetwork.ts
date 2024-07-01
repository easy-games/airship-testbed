import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";

export const SurvivalNetwork = {
	ClientToServer: {
        // PlaceBlock: new RemoteEvent<[pos: Vector3, itemType: CoreItemType, rotation?: number]>("PlaceBlock"),
    },
	ServerToClient: {
        BlockPlace: new RemoteEvent<[pos: Vector3, voxel: number, entityId?: number]>("BlockPlace"),
		BlockGroupPlace: new RemoteEvent<[positions: Vector3[], voxels: number[], entityId?: number]>(
			"BlockGroupPlace",
		),
        // RevertBlockPlace: new RemoteEvent<[pos: Vector3]>("RevertBlockPlace"),
        SyncPrefabBlocks: new RemoteEvent<[blockPositions: Vector3[]]>("SyncPrefabBlocks"),
    },
}