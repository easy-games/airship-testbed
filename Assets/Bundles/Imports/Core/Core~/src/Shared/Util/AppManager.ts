import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Keyboard, Mouse } from "Shared/UserInput";
import { AudioManager } from "../Audio/AudioManager";
import { Bin } from "./Bin";
import { CanvasAPI, PointerDirection } from "./CanvasAPI";
import { SignalPriority } from "./Signal";

/** Global close key for hiding interfaces. */
const CLOSE_KEY = KeyCode.Escape;

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

	public static Init() {
		const backgroundGO = GameObjectUtil.Instantiate(
			AssetBridge.Instance.LoadAsset("Imports/Core/Shared/Resources/Prefabs/AppManagerBackground.prefab"),
		);
		this.backgroundCanvas = backgroundGO.GetComponent<Canvas>();
		this.backgroundCanvas.enabled = false;
		const refs = backgroundGO.GetComponent<GameObjectReferences>();
		this.backgroundObject = refs.GetValue("UI", "Background");

		CanvasAPI.OnPointerEvent(this.backgroundObject, (direction, button) => {
			if (direction === PointerDirection.DOWN) {
				this.Close();
			}
		});
	}

	public static OpenCustom(
		onClose: () => void,
		config?: {
			darkBackground?: boolean;
			darkBackgroundSortingOrder?: number;
		},
	): void {
		this.Close({ noCloseSound: true });

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
		},
	): void {
		/* Close open `Canvas` if applicable. */
		if (!config?.addToStack) {
			this.Close({
				noCloseSound: config?.noOpenSound ?? false,
			});
		}

		if (!config?.noOpenSound) {
			AudioManager.PlayGlobal("Imports/Core/Shared/Resources/Sound/UI_Open.wav", {
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
			this.OpenDarkBackground(this.stack.size() + 10);
		}
		canvas.sortingOrder = this.stack.size() + 11;
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
		this.backgroundCanvas.enabled = true;
		this.backgroundCanvas.sortingOrder = sortOrder;
	}

	public static Close(config?: { noCloseSound?: boolean }): void {
		if (!this.opened) return;

		if (!config?.noCloseSound) {
			// AudioManager.PlayGlobal("Imports/Core/Shared/Resources/Sound/UI_Close.wav");
		}

		if (this.stack.size() > 0) {
			const openedApp = this.stack.pop();

			if (openedApp?.canvas) {
				CanvasUIBridge.HideCanvas(openedApp.canvas);
			}
			openedApp?.bin.Clean();
		}

		if (this.stack.size() === 0) {
			this.backgroundCanvas.enabled = false;
			this.opened = false;
		} else {
			const top = this.stack[this.stack.size() - 1];
			if (top.darkBackground) {
				this.backgroundCanvas.enabled = true;
				this.backgroundCanvas.sortingOrder = this.stack.size() + 10;
			} else {
				this.backgroundCanvas.enabled = false;
			}
		}
	}

	/**
	 * Check whether not an `CanvasAppManager` owned canvas is open.
	 * @returns Whether or not an `CanvasAppManager` owned canvas is open.
	 */
	public static IsOpen(): boolean {
		return this.opened;
	}
}

/* Listen for close key globally. */
AppManager.keyboard.OnKeyDown(
	CLOSE_KEY,
	(event) => {
		if (AppManager.IsOpen()) {
			event.SetCancelled(true);
			AppManager.Close();
		}
	},
	SignalPriority.HIGH,
);
