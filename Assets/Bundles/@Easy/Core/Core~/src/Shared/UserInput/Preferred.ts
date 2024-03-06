import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { Game } from "../Game";

export type ControlScheme = "MouseKeyboard" | "Touch";

/** Utility class for observing the player's currently-used control scheme. */
export class Preferred {
	private readonly bin = new Bin();

	/** A signal that fires every time the currently-used control scheme changes. */
	public readonly controlSchemeChanged = new Signal<[controlScheme: ControlScheme]>();

	private controlScheme!: ControlScheme;

	constructor() {
		this.bin.Add(this.controlSchemeChanged);
		this.InitControlScheme();
	}

	private InitControlScheme(): void {
		let platform = Game.platform;
		if (platform === AirshipPlatform.Android || platform === AirshipPlatform.iOS) {
			this.controlScheme = "Touch";
		} else {
			this.controlScheme = "MouseKeyboard";
		}
	}

	/** Get the currently-used control scheme. */
	public GetControlScheme() {
		return this.controlScheme;
	}

	/**
	 * Observe the currently-used control scheme. Fires the `observer` function immediately,
	 * as well as every time the control scheme changes.
	 *
	 * The returned function can be called to stop the observation process.
	 *
	 * The observer function also returns a function which is called when the control scheme
	 * is changed (or the observation process is stopped). This is useful for disconnecting
	 * any inputs regarding the last-observed control scheme.
	 *
	 * ```ts
	 * let stopObserving = preferred.ObserveControlScheme((preferred) => {
	 * 	const bin = new Bin();
	 * 	if (preferred === "MouseKeyboard") {
	 * 		// User last used a mouse or keyboard input, thus listen to relevant devices:
	 * 		const keyboard = bin.Add(new Keyboard());
	 * 		keyboard.GetKeyDownSignal(Key.Space).Connect(() => {
	 * 			print("Space pressed");
	 * 		});
	 * 	}
	 * 	return () => {
	 * 		// Clean up any connections once the preferred scheme changes:
	 * 		bin.Destroy();
	 * 	};
	 * });
	 * ```
	 */
	public ObserveControlScheme(observer: (preferred: ControlScheme) => CleanupFunc): () => void {
		let cleanup: CleanupFunc;
		cleanup = observer(this.controlScheme);
		const disconnectChanged = this.controlSchemeChanged.Connect((controlScheme) => {
			cleanup?.();
			cleanup = observer(controlScheme);
		});
		let observing = true;
		const stopObserving = () => {
			if (!observing) return;
			observing = false;
			disconnectChanged();
			if (cleanup !== undefined) {
				cleanup();
				cleanup = undefined;
			}
		};
		this.bin.Add(stopObserving);
		return stopObserving;
	}

	/** Cleans up any connections/observers. */
	public Destroy() {
		this.bin.Destroy();
	}
}
