import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

/**
 * [Client only]
 *
 * Access using {@link Airship.LoadingScreen}. Manage the player's loading
 * screen when joining your game. This can be useful if your game requires
 * some work on the client before the game is ready to be played, such as
 * spawning a map.
 *
 * Once loading is complete call {@link FinishLoading} to remove the loading screen.
 */
@Singleton({ loadOrder: -10 })
export class LoadingScreenSingleton {
	private coreLoadingScreen!: CoreLoadingScreen;
	private loadingBin = new Bin();

	private hasUsed = false;

	constructor() {
		Airship.LoadingScreen = this;

		if (Game.coreContext === CoreContext.MAIN_MENU) return;
		this.coreLoadingScreen = GameObject.Find("CoreLoadingScreen")?.GetComponent<CoreLoadingScreen>()!;
		this.coreLoadingScreen.SetProgress("Building the World", 10);

		const mouse = new Mouse();
		const unlocker = mouse.AddUnlocker();
		this.loadingBin.Add(() => {
			mouse.RemoveUnlocker(unlocker);
		});

		task.delay(0, () => {
			if (!this.hasUsed) {
				this.FinishLoading();
			}
		});
	}

	protected OnStart(): void {}

	/**
	 * Sets the current fill of the progress bar.
	 * @param step
	 * @param progress Value from 0-1.
	 */
	public SetProgress(step: string, progress: number): void {
		this.hasUsed = true;
		this.coreLoadingScreen!.updatedByGame = true;
		this.coreLoadingScreen!.SetProgress(step, 50 + progress / 2);
	}

	/**
	 * Call when loading complete. This will remove the loading screen.
	 */
	public FinishLoading(): void {
		this.loadingBin.Clean();
		this.coreLoadingScreen?.Close();
	}
}
