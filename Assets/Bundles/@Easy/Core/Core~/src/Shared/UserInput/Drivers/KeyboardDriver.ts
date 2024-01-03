import { Signal, SignalPriority } from "Shared/Util/Signal";
import { KeySignal } from "./Signals/KeySignal";
import { OnUpdate } from "Shared/Util/Timer";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export class KeyboardDriver {
	// public readonly KeyDown = new Signal<[key: KeySignal]>();
	// public readonly KeyUp = new Signal<[key: KeySignal]>();

	private readonly keyDownSignals = new Map<KeyCode, Signal<[key: KeySignal]>>();
	private readonly keyUpSignals = new Map<KeyCode, Signal<[key: KeySignal]>>();

	private readonly keyDownCounter = new Map<KeyCode, number>();
	private readonly keyUpCounter = new Map<KeyCode, number>();

	public readonly anyKeyDownSignal = new Signal<[key: KeySignal]>();
	public readonly anyKeyUpSignal = new Signal<[key: KeySignal]>();

	private static inst: KeyboardDriver;

	private constructor() {
		UserInputService.InputProxy.OnKeyPressEvent((key, isDown) => {
			const uiSelected = CanvasAPI.GetSelectedInstanceId() !== undefined;
			if (isDown) {
				const event = new KeySignal(key, uiSelected);
				this.anyKeyDownSignal.Fire(event);
				if (!event.IsCancelled()) {
					this.keyDownSignals.get(key)?.Fire(event);
				}
			} else {
				const event = new KeySignal(key, uiSelected);
				this.anyKeyUpSignal.Fire(event);
				if (!event.IsCancelled()) {
					this.keyUpSignals.get(key)?.Fire(event);
				}
			}
		});
	}

	public OnKeyDown(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		let count = this.keyDownCounter.get(key);
		if (count === undefined) {
			count = 0;
			UserInputService.InputProxy.RegisterKeyCode(key);
		}
		count++;
		this.keyDownCounter.set(key, count);

		let signal = this.keyDownSignals.get(key);
		if (signal === undefined) {
			signal = new Signal();
			this.keyDownSignals.set(key, signal);
		}

		const disconnect = priority ? signal.ConnectWithPriority(priority, callback) : signal.Connect(callback);
		return () => {
			disconnect();

			// No more connections; remove the signal:
			if (!signal!.HasConnections()) {
				signal!.Destroy();
				this.keyDownSignals.delete(key);
			}

			const newCount = (this.keyDownCounter.get(key) ?? 0) - 1;
			if (newCount <= 0) {
				this.keyDownCounter.delete(key);
				UserInputService.InputProxy.UnregisterKeyCode(key);
			} else {
				this.keyDownCounter.set(key, newCount);
			}
		};
	}

	public OnKeyUp(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		let count = this.keyUpCounter.get(key);
		if (count === undefined) {
			count = 0;
			UserInputService.InputProxy.RegisterKeyCode(key);
		}
		count++;
		this.keyUpCounter.set(key, count);

		let signal = this.keyUpSignals.get(key);
		if (signal === undefined) {
			signal = new Signal();
			this.keyUpSignals.set(key, signal);
		}

		const disconnect = priority ? signal.ConnectWithPriority(priority, callback) : signal.Connect(callback);
		return () => {
			disconnect();

			// No more connections; remove the signal:
			if (!signal!.HasConnections()) {
				signal!.Destroy();
				this.keyUpSignals.delete(key);
			}

			const newCount = (this.keyUpCounter.get(key) ?? 0) - 1;
			if (newCount <= 0) {
				this.keyUpCounter.delete(key);
				UserInputService.InputProxy.UnregisterKeyCode(key);
			} else {
				this.keyUpCounter.set(key, newCount);
			}
		};
	}

	public IsKeyDown(key: KeyCode) {
		const uiSelected = CanvasAPI.GetSelectedInstanceId() !== undefined;
		if (uiSelected) return false;

		return Input.GetKey(key) || Input.GetKeyDown(key);
	}

	/** **NOTE:** Internal only. Use `Keyboard` class instead. */
	public static Instance() {
		return (this.inst ??= new KeyboardDriver());
	}
}
