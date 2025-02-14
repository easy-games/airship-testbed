import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { OnUpdate } from "../Util/Timer";

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

		task.spawn(() => {
			// AddUnlocker can yield, which we need to avoid in singleton constructors,
			// so this is wrapped in a spawn for now.
			this.loadingBin.Add(Mouse.AddUnlocker());
		});

		OnUpdate.Once(() => {
			if (!this.hasUsed) {
				this.FinishLoading();
			}
		});
	}

	protected OnStart(): void {}

	/**
	 * Sets the current fill of the progress bar.
	 * @param step A short description of what's being loaded. This is shown on the loading screen.
	 * @param progress Value from 0-1. This is currently not used but may in the future.
	 */
	public SetProgress(step: string, progress: number = 0): void {
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
