import { Airship } from "Shared/Airship";
import { CoreContext } from "Shared/CoreClientContext";
import { Controller, OnStart } from "Shared/Flamework";
import { Game } from "Shared/Game";
import { Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";

@Controller({ loadOrder: -10 })
export class LoadingScreenSingleton implements OnStart {
	private coreLoadingScreen?: CoreLoadingScreen;
	private loadingBin = new Bin();

	constructor() {
		Airship.loadingScreen = this;

		if (Game.coreContext === CoreContext.MAIN_MENU) return;
		this.coreLoadingScreen = GameObject.Find("CoreLoadingScreen")?.GetComponent<CoreLoadingScreen>()!;
		this.coreLoadingScreen.SetProgress("Building the World", 10);

		const mouse = new Mouse();
		const unlocker = mouse.AddUnlocker();
		this.loadingBin.Add(() => {
			mouse.RemoveUnlocker(unlocker);
		});
	}

	OnStart(): void {}

	/**
	 * Sets the current fill of the progress bar.
	 * @param step
	 * @param progress Value from 0-100.
	 */
	public SetProgress(step: string, progress: number): void {
		this.coreLoadingScreen?.SetProgress(step, 50 + progress / 2);
	}

	public FinishLoading(): void {
		this.loadingBin.Clean();
		this.coreLoadingScreen?.Close();
	}
}
