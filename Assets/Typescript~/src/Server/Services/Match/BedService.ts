import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { BedState } from "Shared/Bed/BedMeta";
import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { ItemType } from "Shared/Item/ItemType";
import { MathUtil } from "Shared/Util/MathUtil";
import { Task } from "Shared/Util/Task";
import { VoxelDataAPI } from "Shared/VoxelWorld/VoxelData/VoxelDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { TeamService } from "../Global/Team/TeamService";
import { MapService } from "./Map/MapService";
import { MatchService } from "./MatchService";

/** Bed block id. */
const BED_BLOCK_ID = GetItemMeta(ItemType.BED).block?.blockId ?? -1;

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
				const teamId = VoxelDataAPI.GetVoxelData<string>(event.blockPos, "teamId");
				if (!teamId) return;
				ServerSignals.BedDestroyed.Fire({ bedTeamId: teamId });
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
			const bedPositions = loadedMap.GetWorldPositions(team.id + "_bed");
			for (const bedPosition of bedPositions) {
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
				WorldAPI.GetMainWorld().PlaceBlock(bedPos, ItemType.BED);
				/* TEMPORARY. Fix `VoxelDataAPI` race condition. */
				Task.Delay(1, () => {
					VoxelDataAPI.SetVoxelData(bedPos, "teamId", team.id);
				});
			}
		}
	}

	/**
	 * Checks whether or not a team's bed is destroyed.
	 * @param teamId A team id.
	 * @returns Whether or not a specific team's bed is destroyed.
	 */
	public IsBedDestroyed(teamId: string): boolean {
		const bedState = this.GetBedStateForTeamId(teamId);
		if (!bedState) return true;
		return bedState.destroyed;
	}

	/**
	 * Fetch bed state with a team id.
	 * @param teamId A team id.
	 * @returns Bed state.
	 */
	public GetBedStateForTeamId(teamId: string): BedState | undefined {
		return this.teamToBed.get(teamId);
	}
}
