import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";

@Controller({})
export class LoadingScreenController implements OnStart {
	private coreLoadingScreen: CoreLoadingScreen;

	constructor() {
		this.coreLoadingScreen = GameObject.Find("CoreLoadingScreen").GetComponent<CoreLoadingScreen>();
		this.coreLoadingScreen.SetProgress("Loading World", 60);

		if (Game.LocalPlayer.Character) {
			this.FinishLoading();
		} else {
			this.SetProgress("Waiting for Character", 85);
			const bin = new Bin();
			bin.Add(
				ClientSignals.EntitySpawn.Connect((event) => {
					if (event.entity.IsLocalCharacter()) {
						bin.Clean();
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
