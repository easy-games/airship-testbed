import { OnStart, Service } from "@easy-games/flamework-core";
import { BlockDataAPI } from "Imports/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";
import { ServerSignals } from "Server/ServerSignals";

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
