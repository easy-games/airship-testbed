import { BlockDataAPI } from "@Easy/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";

@Service({})
export class BWBlockService implements OnStart {
	OnStart(): void {
		ServerSignals.BlockPlace.Connect((event) => {
			if (event.entity) {
				BlockDataAPI.SetBlockData(event.pos, "player_placed", true);
			}
		});
	}
}
