import { Service, OnStart } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { VoxelDataAPI } from "Shared/VoxelWorld/VoxelData/VoxelDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Service({})
export class MapBlockService implements OnStart {
	OnStart(): void {
		/* Start tracking placed blocks AFTER match has started. */
		ServerSignals.MatchStart.connect(() => {
			/*
			 * Voxels placed after match started belong to players.
			 * TODO: We _probably_ want exceptions here. IE: Lucky Blocks?
			 */
			WorldAPI.GetMainWorld().OnVoxelPlaced.Connect((pos, _voxel) => {
				VoxelDataAPI.SetVoxelData(pos, "placedByUser", true);
			});
		});
		/* Don't allow users to damage map blocks. */
		ServerSignals.BeforeBlockHit.Connect((event) => {
			const wasPlacedByUser = VoxelDataAPI.GetVoxelData<boolean>(event.BlockPos, "placedByUser");
			if (!wasPlacedByUser) event.SetCancelled(true);
		});
	}
}
