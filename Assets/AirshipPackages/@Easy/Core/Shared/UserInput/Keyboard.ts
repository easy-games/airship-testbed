import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { KeySignal } from "./Drivers/Signals/KeySignal";

const inputBridge = InputBridge.Instance;

export class Keyboard {
	/**
	 * Fired when a key is pressed down.
	 */
	public static readonly onKeyDownSignal = new Signal<[event: KeySignal]>();

	/**
	 * Fired when a key is released.
	 */
	public static readonly onKeyUpSignal = new Signal<[event: KeySignal]>();

	public static OnKeyDown(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const handle = (event: KeySignal) => {
			if (event.key === key) {
				callback(event);
			}
		};
		return priority
			? this.onKeyDownSignal.ConnectWithPriority(priority, handle)
			: this.onKeyDownSignal.Connect(handle);
	}

	public static OnKeyUp(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const handle = (event: KeySignal) => {
			if (event.key === key) {
				callback(event);
			}
		};

		return priority ? this.onKeyUpSignal.ConnectWithPriority(priority, handle) : this.onKeyUpSignal.Connect(handle);
	}

	/** Returns `true` if the given key is down. */
	public static IsKeyDown(key: Key) {
		return inputBridge.IsKeyDown(key);
	}

	/** Returns `true` if either of the given keys are down. */
	public static IsEitherKeyDown(key1: Key, key2: Key) {
		return this.IsKeyDown(key1) || this.IsKeyDown(key2);
	}

	/** Returns `true` if both keys are down. */
	public static AreBothKeysDown(key1: Key, key2: Key) {
		return this.IsKeyDown(key1) && this.IsKeyDown(key2);
	}
}

inputBridge.OnKeyPressEvent((key, isDown) => {
	const uiSelected = EventSystem.current.currentSelectedGameObject !== undefined;
	const event = new KeySignal(key, uiSelected);
	const keyboardUntyped = Keyboard as {
		onKeyDownSignal: Signal<unknown>;
		onKeyUpSignal: Signal<unknown>;
	};

	if (isDown) {
		if (!event.IsCancelled()) {
			keyboardUntyped.onKeyDownSignal.Fire(event);
		}
	} else {
		if (!event.IsCancelled()) {
			keyboardUntyped.onKeyUpSignal.Fire(event);
		}
	}
});
