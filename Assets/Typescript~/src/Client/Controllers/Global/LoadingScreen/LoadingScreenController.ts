import { Controller, OnStart } from "@easy-games/flamework-core";
import { LoadingScreenController } from "Imports/Core/Client/Controllers/Loading/LoadingScreenController";
import { CoreClientSignals } from "Imports/Core/Client/CoreClientSignals";
import { Game } from "Imports/Core/Shared/Game";
import { Bin } from "Imports/Core/Shared/Util/Bin";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";

@Controller()
export class BWLoadingScreenController implements OnStart {
	constructor(private readonly loadingScreenController: LoadingScreenController) {
		this.CheckWorld();
	}

	private CheckWorld(): void {
		const world = WorldAPI.GetMainWorld();
		if (!world) {
			this.CheckCharacter();
			return;
		}

		if (!world.IsFinishedReplicatingChunksFromServer()) {
			const startTime = os.clock();
			world.OnFinishedReplicatingChunksFromServer.Connect(() => {
				const timeSpent = os.clock() - startTime;
				print("Time spent building world: " + math.floor(timeSpent * 1000) + "ms");
				this.CheckCharacter();
			});
		} else {
			this.CheckCharacter();
		}
	}

	private CheckCharacter(): void {
		if (Game.LocalPlayer.Character) {
			this.loadingScreenController.FinishLoading();
		} else {
			const startTime = os.clock();
			this.loadingScreenController.SetProgress("Waiting for Character", 85);
			const bin = new Bin();
			bin.Add(
				CoreClientSignals.EntitySpawn.Connect((event) => {
					if (event.entity.IsLocalCharacter()) {
						bin.Clean();
						const timeSpent = os.clock() - startTime;
						print("Time spent waiting for character: " + math.floor(timeSpent * 1000) + "ms");
						this.loadingScreenController.FinishLoading();
					}
				}),
			);
		}
	}

	OnStart(): void {}
}
