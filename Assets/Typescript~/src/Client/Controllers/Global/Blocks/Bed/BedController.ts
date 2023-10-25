import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { TeamController } from "@Easy/Core/Client/Controllers/Team/TeamController";
import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import StringUtils from "@Easy/Core/Shared/Types/StringUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { BlockDataAPI } from "@Easy/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { PrefabBlockManager } from "@Easy/Core/Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";

@Controller({})
export class BedController implements OnStart {
	OnStart(): void {
		CoreClientSignals.BlockPlace.Connect((event) => {
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
							if (StringUtils.includes(colorSetter.gameObject.name, "_TC")) {
								colorSetter.SetAllColors(teamColor, true);
							}
						}
					}
				}
			}
		});
	}
}
