import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CropStateDto } from "Shared/Crops/CropMeta";
import { ItemType } from "Shared/Item/ItemType";
import { PrefabBlockManager } from "Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Controller()
export class CropController implements OnStart {
	private cropStates = new Map<string, CropStateDto>();

	private UpdateCropState(position: Vector3, newLevel: number) {
		const gameObject = PrefabBlockManager.Get().GetBlockGameObject(position);
		const cropState = this.cropStates.get(tostring(position));
		if (cropState && gameObject && newLevel <= cropState.cropGrowthMaxLevel) {
			const maxState = cropState.cropGrowthMaxLevel;
			for (let i = 0; i <= maxState; i++) {
				print("update game object state", i, newLevel, newLevel === i);
				gameObject.transform.GetChild(i).gameObject.SetActive(newLevel === i);
			}
			cropState.cropGrowthLevel = newLevel;
		}
	}

	public OnStart(): void {
		CoreNetwork.ServerToClient.CropPlanted.Client.OnServerEvent((event) => {
			this.cropStates.set(tostring(event.position), event);
		});

		CoreNetwork.ServerToClient.CropGrowthUpdated.Client.OnServerEvent((position, level) => {
			this.UpdateCropState(position, level);
		});

		CoreNetwork.ServerToClient.CropSnapshot.Client.OnServerEvent((snapshots) => {
			for (const snapshot of snapshots) {
				this.cropStates.set(tostring(snapshot.position), snapshot);
				this.UpdateCropState(snapshot.position, snapshot.cropGrowthLevel);
			}
		});
	}
}
