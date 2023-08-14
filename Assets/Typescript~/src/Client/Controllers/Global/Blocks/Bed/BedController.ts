import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { TeamController } from "Imports/Core/Client/Controllers/Team/TeamController";
import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { Theme } from "Imports/Core/Shared/Util/Theme";
import { BlockDataAPI } from "Imports/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { PrefabBlockManager } from "Imports/Core/Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";

@Controller({})
export class BedController implements OnStart {
	OnStart(): void {
		ClientSignals.BlockPlace.Connect((event) => {
			if (event.block.itemType === ItemType.BED) {
				const go = PrefabBlockManager.Get().GetBlockGameObject(event.pos);
				if (go) {
					const teamId = BlockDataAPI.GetBlockData<string>(event.pos, "teamId");
					if (teamId) {
						const team = Dependency<TeamController>().GetTeam(teamId);
						const teamColor = team?.color ?? Theme.White;
						const colorSetters = go.GetComponentsInChildren<MaterialColor>();
						for (let i = 0; i < colorSetters.Length; i++) {
							const colorSetter = colorSetters.GetValue(i);
							if (colorSetter.gameObject.tag === "TeamColor") {
								colorSetter.SetAllColors(teamColor, true);
							}
						}
					}
				}
			}
		});
	}
}
