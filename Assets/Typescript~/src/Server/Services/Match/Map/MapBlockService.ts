import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
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
				BlockDataAPI.SetBlockData(pos, "placedByUser", true);
			});
		});
	}
}
