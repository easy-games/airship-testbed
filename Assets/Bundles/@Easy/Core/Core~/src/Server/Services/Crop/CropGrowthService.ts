import { OnStart, Service } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";

interface CropState {
	readonly position: Vector3;
	readonly cropGrowthMaxLevel: number;

	cropGrowthLevel: number;
}

@Service()
export class CropGrowthService implements OnStart {
	private cropMap = new Array<CropState>();

	private CreateCrop() {}

	public OnStart(): void {
		CoreServerSignals.BlockPlace.Connect((event) => {
			const cropBlock = event.itemMeta.cropBlock;
			if (cropBlock) {
				BlockDataAPI.SetBlockData(event.pos, "cropGrowthLevel", 0);

				const cropState: CropState = {
					position: event.pos,
					cropGrowthLevel: 0,
					cropGrowthMaxLevel: cropBlock.numStages,
				};

				this.cropMap.push(cropState);
				print("push crop", inspect(cropState));
			}
		});

		CoreServerSignals.BlockDestroyed.Connect((event) => {
			const matchingBlock = this.cropMap.findIndex((f) => f.position === event.blockPos);
			if (matchingBlock !== -1) {
				print("remove block", matchingBlock);
				this.cropMap.remove(matchingBlock);
			}
		});
	}
}
