import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CropStateDto } from "Shared/Crops/CropMeta";
import { Task } from "Shared/Util/Task";
import { SharedTime } from "Shared/Util/TimeUtil";
import { SetInterval } from "Shared/Util/Timer";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

/** Snapshot send delay after user connects. */
const SNAPSHOT_SEND_DELAY = 1;

export const enum CoreCropBlockMetaKeys {
	CROP_GROWTH_LEVEL = "cropGrowthLevel",
	CROP_HARVESTABLE = "cropHarvestable",
}

@Service()
export class CropGrowthService implements OnStart {
	private cropCounter = 0;
	private cropStates = new Array<CropStateDto>();

	public OnStart(): void {
		SetInterval(5, () => {
			for (const cropState of this.cropStates) {
				if (cropState.cropGrowthLevel >= cropState.cropGrowthMaxLevel) continue;

				/// If we've reached the next growth level for this crop, we'll bump the level up
				if (cropState.lastGrowthTick + cropState.growthIntervalSeconds < SharedTime()) {
					cropState.cropGrowthLevel += 1;
					BlockDataAPI.SetBlockData(
						cropState.position,
						CoreCropBlockMetaKeys.CROP_GROWTH_LEVEL,
						cropState.cropGrowthLevel,
						true,
					);
					print("crop levelled up to level", cropState.cropGrowthLevel, "!");

					cropState.lastGrowthTick = SharedTime();

					CoreNetwork.ServerToClient.CropGrowthUpdated.server.FireAllClients(
						cropState.cropIdx,
						cropState.cropGrowthLevel,
					);
				}

				// If max level, set harvestable!
				if (cropState.cropGrowthLevel >= cropState.cropGrowthMaxLevel) {
					BlockDataAPI.SetBlockData(cropState.position, CoreCropBlockMetaKeys.CROP_HARVESTABLE, true, true);
				}
			}
		});

		/* Handle late joiners. */
		CoreServerSignals.PlayerJoin.Connect((event) => {
			Task.Delay(SNAPSHOT_SEND_DELAY, () => {
				CoreNetwork.ServerToClient.CropSnapshot.server.FireClient(event.player.clientId, this.cropStates);
			});
		});

		CoreServerSignals.BlockPlace.Connect((event) => {
			const world = WorldAPI.GetMainWorld();
			if (!world) return;

			const cropBlock = world.GetBlockAt(event.pos).itemDef?.cropBlock;
			if (cropBlock) {
				BlockDataAPI.SetBlockData(event.pos, CoreCropBlockMetaKeys.CROP_GROWTH_LEVEL, 0, true);
				BlockDataAPI.SetBlockData(event.pos, CoreCropBlockMetaKeys.CROP_HARVESTABLE, false, true);

				const cropState: CropStateDto = {
					position: event.pos,
					cropIdx: this.cropCounter++,
					cropGrowthLevel: 0,
					lastGrowthTick: SharedTime(),
					growthIntervalSeconds: cropBlock.stageGrowthDuration.totalSeconds,
					cropGrowthMaxLevel: cropBlock.numStages - 1,
				};

				this.cropStates.push(cropState);
				CoreNetwork.ServerToClient.CropPlanted.server.FireAllClients(cropState);
			}
		});

		CoreServerSignals.BlockDestroyed.Connect((event) => {
			const matchingBlock = this.cropStates.findIndex((f) => f.position === event.blockPos);
			if (matchingBlock !== -1) {
				const cropState = this.cropStates[matchingBlock];
				print("destroy block at", cropState.position);

				this.cropStates.remove(matchingBlock);
				CoreNetwork.ServerToClient.CropHarvested.server.FireAllClients(cropState.cropIdx);
			}
		});
	}
}
