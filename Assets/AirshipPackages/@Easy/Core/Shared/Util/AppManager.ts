import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AudioManager } from "../Audio/AudioManager";
import { Game } from "../Game";
import { Bin } from "./Bin";
import { CanvasAPI, PointerDirection } from "./CanvasAPI";
import { SignalPriority } from "./Signal";
import { SetTimeout } from "./Timer";

/** Global close key for hiding interfaces. */
const CLOSE_KEY = Key.Escape;

interface OpenedApp {
	canvas?: Canvas;
	bin: Bin;
	darkBackground: boolean;
}

export class AppManager {
	/** Global mouse instance. */
	private static mouse = new Mouse();
	/** Global keyboard instance. */
	public static keyboard = new Keyboard();

	private static opened: boolean;

	private static stack = new Array<OpenedApp>();

	private static backgroundCanvas: Canvas;
	private static backgroundObject: GameObject;
	private static backgroundCanvasGroup: CanvasGroup;

	private static darkBackgroundTransitionBin = new Bin();

	public static Init() {
		let backgroundGO: GameObject;
		if (Game.IsGameLuauContext()) {
			backgroundGO = Object.Instantiate(
				AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/AppManagerBackground.prefab"),
				CoreRefs.rootTransform,
			);
		} else {
			backgroundGO = Object.Instantiate(
				AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/AppManagerBackground.prefab"),
				CoreRefs.protectedTransform,
			);
		}
		this.backgroundCanvas = backgroundGO.GetComponent<Canvas>()!;
		this.backgroundCanvas.enabled = false;
		const refs = backgroundGO.GetComponent<GameObjectReferences>()!;
		this.backgroundObject = refs.GetValue("UI", "Background");
		this.backgroundCanvasGroup = this.backgroundCanvas.gameObject.GetComponent<CanvasGroup>()!;
		this.backgroundCanvasGroup.alpha = 0;

		CanvasAPI.OnPointerEvent(this.backgroundObject, (direction, button) => {
			if (direction === PointerDirection.DOWN) {
				this.Close();
			}
		});

		if (Game.IsProtectedLuauContext()) {
			// returns true if consumed [esc] press
			contextbridge.callback<() => boolean>("AppManager:EscapePressedFromGame", (from) => {
				if (AppManager.IsOpen()) {
					AppManager.Close();
					return true;
				}
				return false;
			});

			contextbridge.callback<() => boolean>("AppManager:IsOpenFromGame", (from) => {
				return this.IsOpen();
			});
		}
	}

	public static OpenCustom(
		onClose: () => void,
		config?: {
			darkBackground?: boolean;
			darkBackgroundSortingOrder?: number;
			addToStack?: boolean;
		},
	): void {
		if (!config?.addToStack) {
			this.Close({ noCloseSound: true });
		}

		this.opened = true;

		if (config?.darkBackground) {
			this.OpenDarkBackground(config.darkBackgroundSortingOrder ?? this.stack.size() + 10);
		}

		/* Handle mouse locking. */
		const lockId = this.mouse.AddUnlocker();
		const bin = new Bin();
		this.stack.push({
			bin: bin,
			darkBackground: false,
		});
		bin.Add(() => this.mouse.RemoveUnlocker(lockId));
		bin.Add(onClose);
	}

	/**
	 * Open a Canvas. Any other `AppManager` owned UIDocument will be immediately closed.
	 * @param element A GameObject with a `Canvas` component.
	 */
	public static Open(
		canvas: Canvas,
		config?: {
			noOpenSound?: boolean;
			onClose?: () => void;
			noDarkBackground?: boolean;
			addToStack?: boolean;
			sortingOrderOffset?: number;
		},
	): void {
		/* Close open `Canvas` if applicable. */
		if (!config?.addToStack) {
			this.Close({
				noCloseSound: config?.noOpenSound ?? false,
			});
		}

		if (!config?.noOpenSound) {
			AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/UI_Open.wav", {
				volumeScale: 0.4,
			});
		}

		/*
		 * Canvas MUST be in Render Mode `RenderMode.ScreenSpaceOverlay`.
		 * This enforced on the C# side.
		 */
		// CanvasUIBridge.InitializeCanvas(canvas, true);

		/* Enable and cache. */
		if (!config?.noDarkBackground) {
			this.OpenDarkBackground(this.stack.size() + 10 + (config?.sortingOrderOffset ?? 0));
		}
		canvas.sortingOrder = this.stack.size() + 11 + (config?.sortingOrderOffset ?? 0);
		canvas.enabled = true;
		this.opened = true;

		const bin = new Bin();

		this.stack.push({
			canvas,
			bin,
			darkBackground: !config?.noDarkBackground,
		});

		if (config?.onClose !== undefined) {
			bin.Add(config.onClose);
		}

		/* Handle mouse locking. */
		const lockId = this.mouse.AddUnlocker();
		bin.Add(() => this.mouse.RemoveUnlocker(lockId));
	}

	public static OpenDarkBackground(sortOrder: number) {
		this.darkBackgroundTransitionBin.Clean();
		const t = this.backgroundCanvasGroup.TweenCanvasGroupAlpha(1, 0.06);
		this.darkBackgroundTransitionBin.Add(() => {
			if (t.IsDestroyed()) return;
			t.Cancel();
		});
		this.backgroundCanvas.enabled = true;
		this.backgroundCanvas.sortingOrder = sortOrder;
	}

	public static CloseDarkBackground(): void {
		this.darkBackgroundTransitionBin.Clean();
		const t = this.backgroundCanvasGroup.TweenCanvasGroupAlpha(0, 0.06);
		this.darkBackgroundTransitionBin.Add(() => {
			if (t.IsDestroyed()) return;
			t.Cancel();
		});
		this.darkBackgroundTransitionBin.Add(
			SetTimeout(0.06, () => {
				this.backgroundCanvas.enabled = false;
			}),
		);
	}

	public static Close(config?: { noCloseSound?: boolean }): void {
		if (Game.IsGameLuauContext()) {
			if (contextbridge.invoke<() => boolean>("AppManager:EscapePressedFromGame", LuauContext.Protected)) {
				return;
			}
		}

		if (!this.opened) return;

		if (!config?.noCloseSound) {
			// AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/UI_Close.wav");
		}

		if (this.stack.size() > 0) {
			const openedApp = this.stack.pop();

			if (openedApp?.canvas) {
				CanvasUIBridge.HideCanvas(openedApp.canvas);
			}
			openedApp?.bin.Clean();
		}

		if (this.stack.size() === 0) {
			this.CloseDarkBackground();
			this.opened = false;
		} else {
			const top = this.stack[this.stack.size() - 1];
			if (top.darkBackground) {
				this.OpenDarkBackground(this.stack.size() + 10);
			} else {
				this.CloseDarkBackground();
			}
		}
	}

	/**
	 * @internal
	 */
	// public static OpenMainMenu(): void {
	// 	contextbridge.invoke<() => void>("MainMenu:OpenFromGame", LuauContext.Protected);
	// 	this.OpenCustom(() => {
	// 		contextbridge.invoke<() => void>("MainMenu:CloseFromGame", LuauContext.Protected);
	// 	});
	// }

	/**
	 * Check whether not an `CanvasAppManager` owned canvas is open.
	 * @returns Whether or not an `CanvasAppManager` owned canvas is open.
	 */
	public static IsOpen(): boolean {
		if (Game.IsGameLuauContext()) {
			if (contextbridge.invoke<() => boolean>("AppManager:IsOpenFromGame", LuauContext.Protected)) {
				return true;
			}
		}
		return this.opened;
	}
}

/* Listen for close key globally. */
if (Game.IsGameLuauContext()) {
	AppManager.keyboard.OnKeyDown(
		CLOSE_KEY,
		(event) => {
			if (event.IsCancelled()) return;
			if (AppManager.IsOpen()) {
				event.SetCancelled(true);
				AppManager.Close();
			}
		},
		SignalPriority.HIGH,
	);
	AppManager.keyboard.OnKeyDown(
		CLOSE_KEY,
		(event) => {
			event.SetCancelled(true);
			contextbridge.invoke<() => void>("MainMenu:OpenFromGame", LuauContext.Protected);
		},
		SignalPriority.LOW,
	);
	AppManager.keyboard.OnKeyDown(
		Key.F,
		(event) => {
			if (event.uiProcessed) return;
			if (AppManager.IsOpen()) {
				event.SetCancelled(true);
				AppManager.Close();
			}
		},
		SignalPriority.HIGH,
	);
}
