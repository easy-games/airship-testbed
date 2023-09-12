import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Keyboard, Mouse } from "Shared/UserInput";
import { AudioManager } from "../Audio/AudioManager";
import { Bin } from "./Bin";
import { CanvasAPI, PointerDirection } from "./CanvasAPI";
import { SignalPriority } from "./Signal";

/** Global close key for hiding interfaces. */
const CLOSE_KEY = KeyCode.Escape;

export class AppManager {
	/** Global mouse instance. */
	private static mouse = new Mouse();
	/** Global keyboard instance. */
	public static keyboard = new Keyboard();

	private static opened: boolean;

	/** Currently open canvas. */
	private static openCanvas: Canvas | undefined;
	/** Mouse lock manager bin. */
	private static openCanvasBin = new Bin();

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

	public static OpenCustom(onClose: () => void): void {
		this.Close({ noCloseSound: true });

		this.opened = true;

		/* Handle mouse locking. */
		const lockId = this.mouse.AddUnlocker();
		this.openCanvasBin.Add(() => this.mouse.RemoveUnlocker(lockId));
		this.openCanvasBin.Add(onClose);
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
		},
	): void {
		/* Close open `Canvas` if applicable. */
		this.Close({
			noCloseSound: config?.noOpenSound ?? false,
		});

		if (!config?.noOpenSound) {
			AudioManager.PlayGlobal("UI_Open.wav", {
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
			this.backgroundCanvas.enabled = true;
		}
		this.openCanvas = canvas;
		this.openCanvas.sortingOrder = 11;
		this.openCanvas.enabled = true;
		this.opened = true;

		if (config?.onClose !== undefined) {
			this.openCanvasBin.Add(config.onClose);
		}

		/* Handle mouse locking. */
		const lockId = this.mouse.AddUnlocker();
		this.openCanvasBin.Add(() => this.mouse.RemoveUnlocker(lockId));
	}

	public static Close(config?: { noCloseSound?: boolean }): void {
		if (!this.opened) return;
		this.opened = false;

		if (!config?.noCloseSound) {
			// AudioManager.PlayGlobal("UI_Close.wav");
		}

		if (this.openCanvas) {
			CanvasUIBridge.HideCanvas(this.openCanvas);
			this.backgroundCanvas.enabled = false;
			this.openCanvas = undefined;
		}

		/* Handle mouse unlocking. */
		this.openCanvasBin.Clean();
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
