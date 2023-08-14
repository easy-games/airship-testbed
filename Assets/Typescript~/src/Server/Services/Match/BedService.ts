import { OnStart, Service } from "@easy-games/flamework-core";
import { TeamService } from "Imports/Core/Server/Services/Team/TeamService";
import { Game } from "Imports/Core/Shared/Game";
import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { ItemUtil } from "Imports/Core/Shared/Item/ItemUtil";
import { Team } from "Imports/Core/Shared/Team/Team";
import { ColorUtil } from "Imports/Core/Shared/Util/ColorUtil";
import { MathUtil } from "Imports/Core/Shared/Util/MathUtil";
import { Theme } from "Imports/Core/Shared/Util/Theme";
import { BlockDataAPI } from "Imports/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";
import { BWServerSignals } from "Server/BWServerSignals";
import { ServerSignals } from "Server/ServerSignals";
import { BedState } from "Shared/Bed/BedMeta";
import { MapService } from "./Map/MapService";
import { MatchService } from "./MatchService";

/** Bed block id. */
const BED_BLOCK_ID = ItemUtil.GetItemMeta(ItemType.BED).block?.blockId ?? -1;

@Service({})
export class BedService implements OnStart {
	/** Team id to bed map. */
	private teamToBed = new Map<string, BedState>();

	constructor(
		private readonly mapService: MapService,
		private readonly matchService: MatchService,
		private readonly teamService: TeamService,
	) {}

	OnStart(): void {
		/* Listen for bed destroyed. */
		ServerSignals.BeforeBlockDestroyed.Connect((event) => {
			if (event.blockId === BED_BLOCK_ID) {
				const teamId = BlockDataAPI.GetBlockData<string>(event.blockPos, "teamId");
				if (!teamId) return;
				const team = this.teamService.GetTeamById(teamId);
				if (team) {
					const breakerTeam = event.entity?.player?.GetTeam();
					if (event.entity && breakerTeam) {
						Game.BroadcastMessage(
							ColorUtil.ColoredText(breakerTeam.color, event.entity.GetDisplayName()) +
								ColorUtil.ColoredText(Theme.Aqua, " broke ") +
								ColorUtil.ColoredText(team.color, `${team.name} team's bed`) +
								ColorUtil.ColoredText(Theme.Aqua, "!"),
						);
					}
					const bedState = this.GetBedStateForTeam(team);
					if (bedState) {
						bedState.destroyed = true;
					}
					BWServerSignals.BedDestroyed.Fire({ team });
				}
			}
		});
		ServerSignals.MatchStart.connect(() => {
			this.SpawnBeds();
		});
	}

	/** Spawn beds for each team. */
	private SpawnBeds(): void {
		const loadedMap = this.mapService.GetLoadedMap();
		if (!loadedMap) return;

		// Spawn beds.
		for (let team of this.teamService.GetTeams()) {
			const bedPosition = loadedMap.GetWorldPosition(team.id + "_bed");
			const bedPos = MathUtil.FloorVec(
				new Vector3(bedPosition.Position.x, bedPosition.Position.y, bedPosition.Position.z),
			);
			const bedState: BedState = {
				teamId: team.id,
				position: bedPos,
				/* _Always_ starts as not destroyed. */
				destroyed: false,
			};
			this.teamToBed.set(team.id, bedState);
			const itemMeta = ItemUtil.GetItemMeta(ItemType.BED);
			WorldAPI.GetMainWorld().PlaceBlock(bedPos, ItemType.BED, {
				blockData: {
					teamId: team.id,
					health: itemMeta.block!.health!, // this is a hack.
				},
			});
		}
	}

	/**
	 * Checks whether or not a team's bed is destroyed.
	 * @param teamId A team id.
	 * @returns Whether or not a specific team's bed is destroyed.
	 */
	public IsBedDestroyed(team: Team): boolean {
		const bedState = this.GetBedStateForTeam(team);
		if (!bedState) return true;
		return bedState.destroyed;
	}

	/**
	 * Fetch bed state with a team id.
	 * @param teamId A team id.
	 * @returns Bed state.
	 */
	public GetBedStateForTeam(team: Team): BedState | undefined {
		return this.teamToBed.get(team.id);
	}
}
