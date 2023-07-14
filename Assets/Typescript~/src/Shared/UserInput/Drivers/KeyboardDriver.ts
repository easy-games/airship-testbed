import { Signal, SignalPriority } from "Shared/Util/Signal";
import { KeySignal } from "./Signals/KeySignal";
import { OnUpdate } from "Shared/Util/Timer";

export class KeyboardDriver {
	// public readonly KeyDown = new Signal<[key: KeySignal]>();
	// public readonly KeyUp = new Signal<[key: KeySignal]>();

	private readonly keyDownSignals = new Map<KeyCode, Signal<[key: KeySignal]>>();
	private readonly keyUpSignals = new Map<KeyCode, Signal<[key: KeySignal]>>();

	public readonly AnyKeyDownSignal = new Signal<[key: KeySignal]>();
	public readonly AnyKeyUpSignal = new Signal<[key: KeySignal]>();

	private static inst: KeyboardDriver;

	private constructor() {
		// UserInputService.InputProxy.OnKeyPressEvent((key, isDown) => {
		// 	if (isDown) {
		// 		this.KeyDown.Fire(new KeySignal(key));
		// 	} else {
		// 		this.KeyUp.Fire(new KeySignal(key));
		// 	}
		// });

		OnUpdate.Connect(() => {
			Profiler.BeginSample("PollForKeys");
			for (const [key, keyDownSignal] of this.keyDownSignals) {
				if (Input.GetKeyDown(key)) {
					const event = new KeySignal(key);
					this.AnyKeyDownSignal.Fire(event);
					if (event.IsCancelled()) continue;
					keyDownSignal.Fire(event);
				}
			}
			for (const [key, keyUpSignal] of this.keyUpSignals) {
				if (Input.GetKeyUp(key)) {
					const event = new KeySignal(key);
					this.AnyKeyUpSignal.Fire(event);
					if (event.IsCancelled()) continue;
					keyUpSignal.Fire(event);
				}
			}
			Profiler.EndSample();
		});
	}

	public OnKeyDown(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority) {
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
		};
	}

	public OnKeyUp(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority) {
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
		};
	}

	public IsKeyDown(key: KeyCode) {
		// return UserInputService.InputProxy.IsKeyDown(key);
		return Input.GetKey(key) || Input.GetKeyDown(key);
	}

	/** **NOTE:** Internal only. Use `Keyboard` class instead. */
	public static instance() {
		return (this.inst ??= new KeyboardDriver());
	}
}
