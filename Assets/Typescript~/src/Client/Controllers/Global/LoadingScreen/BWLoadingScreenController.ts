import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { MatchController } from "Client/Controllers/Match/MatchController";
import { BedWars } from "Shared/BedWars/BedWars";

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
			world.onFinishedReplicatingChunksFromServer.Connect(() => {
				const timeSpent = os.clock() - startTime;
				print("Time spent building world: " + math.floor(timeSpent * 1000) + "ms");
				this.CheckCharacter();
			});
		} else {
			this.CheckCharacter();
		}
	}

	private CheckCharacter(): void {
		if (BedWars.IsMatchMode() && Dependency<MatchController>().eliminated) {
			this.loadingScreenController.FinishLoading();
			return;
		}
		if (Game.localPlayer.character) {
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
			if (BedWars.IsMatchMode())
				bin.Add(
					Dependency<MatchController>().onEliminated.Connect(() => {
						bin.Clean();
						this.loadingScreenController.FinishLoading();
					}),
				);
		}
	}

	OnStart(): void {}
}
