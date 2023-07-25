import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { ItemType } from "Shared/Item/ItemType";
import { Theme } from "Shared/Util/Theme";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { PrefabBlockManager } from "Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";
import { TeamController } from "../../Team/TeamController";

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
						const rens = go.GetComponentsInChildren<MeshRenderer>();
						for (let i = 0; i < rens.Length; i++) {
							const ren = rens.GetValue(i);
							if (ren.gameObject.tag === "TeamColor") {
								const ren = rens.GetValue(i);
								const mats = ren.materials;
								for (let j = 0; j < mats.Length; j++) {
									const mat = mats.GetValue(j);
									mat.color = new Color(
										mat.color.r * teamColor.r,
										mat.color.g * teamColor.g,
										mat.color.b * teamColor.b,
									);
								}
							}
						}
					}
				}
			}
		});
	}
}
