import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CropStateDto } from "Shared/Crops/CropMeta";
import { ItemType } from "Shared/Item/ItemType";
import { PrefabBlockManager } from "Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { ProximityPromptController } from "../ProximityPrompt/ProximityPromptController";
import { ProximityPrompt } from "../ProximityPrompt/ProximityPrompt";

@Controller()
export class CropController implements OnStart {
	private cropStates = new Map<number, CropStateDto>();

	public constructor(private proximityPromptController: ProximityPromptController) {}

	private UpdateCropState(cropIdx: number, newLevel: number) {
		const cropState = this.cropStates.get(cropIdx);
		if (!cropState) return;

		const gameObject = PrefabBlockManager.Get().GetBlockGameObject(cropState.position);

		if (cropState && gameObject && newLevel <= cropState.cropGrowthMaxLevel) {
			const transform = gameObject.transform;

			const maxState = cropState.cropGrowthMaxLevel;
			for (let i = 0; i <= maxState; i++) {
				const childGameObject = transform.GetChild(i).gameObject;
				childGameObject.SetActive(newLevel === i);
			}
			cropState.cropGrowthLevel = newLevel;
		}
	}

	public OnStart(): void {
		CoreNetwork.ServerToClient.CropPlanted.Client.OnServerEvent((event) => {
			print("planted", event.cropIdx);
			this.cropStates.set(event.cropIdx, event);
			this.UpdateCropState(event.cropIdx, 0);
		});

		CoreNetwork.ServerToClient.CropGrowthUpdated.Client.OnServerEvent((cropId, level) => {
			print("growth updated", cropId);
			this.UpdateCropState(cropId, level);
		});

		CoreNetwork.ServerToClient.CropHarvested.Client.OnServerEvent((cropId) => {
			print("harvested", cropId);
			this.cropStates.delete(cropId);
		});

		CoreNetwork.ServerToClient.CropSnapshot.Client.OnServerEvent((snapshots) => {
			for (const snapshot of snapshots) {
				this.cropStates.set(snapshot.cropIdx, snapshot);
				this.UpdateCropState(snapshot.cropIdx, snapshot.cropGrowthLevel);
			}
		});
	}
}
