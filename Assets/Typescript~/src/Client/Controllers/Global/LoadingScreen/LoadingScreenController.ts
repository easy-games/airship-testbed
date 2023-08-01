import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Controller({})
export class LoadingScreenController implements OnStart {
	private coreLoadingScreen: CoreLoadingScreen;

	constructor() {
		this.coreLoadingScreen = GameObject.Find("CoreLoadingScreen").GetComponent<CoreLoadingScreen>();
		this.coreLoadingScreen.SetProgress("Building the World", 60);

		this.CheckWorld();
	}

	private CheckWorld(): void {
		const world = WorldAPI.GetMainWorld();
		if (!world.IsFinishedLoading()) {
			const startTime = os.clock();
			world.OnFinishedLoading.Connect(() => {
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
			this.FinishLoading();
		} else {
			const startTime = os.clock();
			this.SetProgress("Waiting for Character", 85);
			const bin = new Bin();
			bin.Add(
				ClientSignals.EntitySpawn.Connect((event) => {
					if (event.entity.IsLocalCharacter()) {
						bin.Clean();
						const timeSpent = os.clock() - startTime;
						print("Time spent waiting for character: " + math.floor(timeSpent * 1000) + "ms");
						this.FinishLoading();
					}
				}),
			);
		}
	}

	OnStart(): void {}

	/**
	 * Sets the current fill of the progress bar.
	 * @param step
	 * @param progress Value from 0-100.
	 */
	public SetProgress(step: string, progress: number): void {
		this.coreLoadingScreen.SetProgress(step, progress);
	}

	public FinishLoading(): void {
		this.coreLoadingScreen.Close();
	}
}
