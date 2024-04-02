import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { KeySignal } from "./Signals/KeySignal";

export class KeyboardDriver {
	public readonly anyKeyDownSignal = new Signal<[key: KeySignal]>();
	public readonly anyKeyUpSignal = new Signal<[key: KeySignal]>();

	public readonly keyDown = new Signal<[key: KeySignal]>();
	public readonly keyUp = new Signal<[key: KeySignal]>();

	private readonly inputBridge: InputBridge;

	private static inst: KeyboardDriver;

	private constructor() {
		this.inputBridge = InputBridge.Instance;

		this.inputBridge.OnKeyPressEvent((key, isDown) => {
			const uiSelected = EventSystem.current.currentSelectedGameObject !== undefined;
			const event = new KeySignal(key, uiSelected);
			if (isDown) {
				this.anyKeyDownSignal.Fire(event);
				if (!event.IsCancelled()) {
					this.keyDown.Fire(event);
				}
			} else {
				this.anyKeyUpSignal.Fire(event);
				if (!event.IsCancelled()) {
					this.keyUp.Fire(event);
				}
			}
		});
	}

	public OnKeyDown(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const handle = (event: KeySignal) => {
			if (event.key === key) {
				callback(event);
			}
		};

		return priority ? this.keyDown.ConnectWithPriority(priority, handle) : this.keyDown.Connect(handle);
	}

	public OnKeyUp(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const handle = (event: KeySignal) => {
			if (event.key === key) {
				callback(event);
			}
		};

		return priority ? this.keyUp.ConnectWithPriority(priority, handle) : this.keyUp.Connect(handle);
	}

	public IsKeyDown(key: Key) {
		const uiSelected = CanvasAPI.GetSelectedInstanceId() !== undefined;
		if (uiSelected) return false;

		return this.inputBridge.IsKeyDown(key);
	}

	/** **NOTE:** Internal only. Use `Keyboard` class instead. */
	public static Instance() {
		return (this.inst ??= new KeyboardDriver());
	}
}
