import { OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { ServerSignals } from "Server/ServerSignals";
import { BedState } from "Shared/Bed/BedMeta";
import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { ItemType } from "Shared/Item/ItemType";
import { MathUtil } from "Shared/Util/MathUtil";
import { Task } from "Shared/Util/Task";
import { VoxelDataAPI } from "Shared/VoxelWorld/VoxelData/VoxelDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { LoadedMap } from "./Map/LoadedMap";
import { MapService } from "./Map/MapService";
import { MatchService } from "./MatchService";

/** Bed block id. */
const BED_BLOCK_ID = GetItemMeta(ItemType.BED).block?.blockId ?? -1;

@Service({})
export class BedService implements OnStart {
	/** Loaded map. */
	private loadedMap: LoadedMap | undefined;
	/** Team id to bed map. */
	private teamToBed = new Map<string, BedState>();

	constructor(private readonly mapService: MapService, private readonly matchService: MatchService) {}

	OnStart(): void {
		/* Listen for bed destroyed. */
		ServerSignals.BeforeBlockDestroyed.Connect((event) => {
			if (event.blockId === BED_BLOCK_ID) {
				const teamId = VoxelDataAPI.GetVoxelData<string>(event.blockPos, "teamId");
				if (!teamId) return;
				ServerSignals.BedDestroyed.Fire({ bedTeamId: teamId });
			}
		});
		/* Spawn beds after map load and match start. */
		Task.Spawn(() => {
			this.loadedMap = this.mapService.WaitForMapLoaded();
			ServerSignals.MatchStart.connect(() => this.SpawnBeds());
		});
	}

	/** Spawn beds for each team. */
	private SpawnBeds(): void {
		/* Spawn beds. */
		const beds = this.loadedMap!.GetAllBeds();
		ObjectUtils.keys(beds).forEach((teamId: string | number) => {
			const bed = beds[teamId];
			const bedPos = MathUtil.FloorVec(new Vector3(bed.Position.x, bed.Position.y, bed.Position.z));
			const bedState: BedState = {
				teamId: teamId as string,
				position: bedPos,
				/* _Always_ starts as not destroyed. */
				destroyed: false,
			};
			this.teamToBed.set(teamId as string, bedState);
			WorldAPI.GetMainWorld().PlaceBlock(bedPos, ItemType.BED);
			/* TEMPORARY. Fix `VoxelDataAPI` race condition. */
			Task.Delay(1, () => {
				VoxelDataAPI.SetVoxelData(bedPos, "teamId", teamId as string);
			});
		});
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
