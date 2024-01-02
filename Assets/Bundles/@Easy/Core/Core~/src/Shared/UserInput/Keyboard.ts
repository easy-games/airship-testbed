import { Bin } from "Shared/Util/Bin";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { SignalProxy } from "Shared/Util/SignalProxy";
import { KeyboardDriver } from "./Drivers/KeyboardDriver";
import { KeySignal } from "./Drivers/Signals/KeySignal";

export class Keyboard {
	private readonly bin = new Bin();
	private readonly keyboardDriver = KeyboardDriver.Instance();
	// private readonly keysDown = new Map<KeyCode, boolean>();

	private readonly keyUpDownDisconnects: Callback[] = [];

	/**
	 * The `AnyKeyDown` signal will fire when any already-registered key is pressed. This means that
	 * it will only fire for keys that are already being listened for via `OnKeyDown`.
	 */
	public readonly AnyKeyDown: Signal<[event: KeySignal]>;
	/**
	 * The `AnyKeyDown` signal will fire when any already-registered key is released. This means that
	 * it will only fire for keys that are already being listened for via `OnKeyUp`.
	 */
	public readonly AnyKeyUp: Signal<[event: KeySignal]>;

	constructor() {
		this.AnyKeyDown = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.AnyKeyDownSignal));
		this.AnyKeyUp = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.AnyKeyUpSignal));
		// this.KeyDown = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.KeyDown));
		// this.bin.Add(this.KeyDown);
		// this.bin.Add(this.KeyUp);
		// this.bin.Connect(this.keyboardDriver.KeyDown, (key) => {
		// 	this.keysDown.set(key.Key, true);
		// 	this.KeyDown.Fire(key);
		// });
		// this.bin.Connect(this.keyboardDriver.KeyUp, (key) => {
		// 	this.keysDown.set(key.Key, false);
		// 	this.KeyUp.Fire(key);
		// });
		this.bin.Add(() => {
			for (const disconnect of this.keyUpDownDisconnects) {
				disconnect();
			}
			this.keyUpDownDisconnects.clear();
		});
	}

	private TrackDisconnect(disconnect: () => void) {
		this.keyUpDownDisconnects.push(disconnect);
		return () => {
			const idx = this.keyUpDownDisconnects.indexOf(disconnect);
			if (idx !== -1) {
				this.keyUpDownDisconnects.remove(idx);
			}
			disconnect();
		};
	}

	public OnKeyDown(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const disconnect = this.keyboardDriver.OnKeyDown(key, callback, priority);
		return this.TrackDisconnect(disconnect);
	}

	public OnKeyUp(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const disconnect = this.keyboardDriver.OnKeyUp(key, callback, priority);
		return this.TrackDisconnect(disconnect);
	}

	/** Returns `true` if the given key is down. */
	public IsKeyDown(key: KeyCode) {
		// let keyDown = this.keysDown.get(key);
		// if (keyDown === undefined) {
		// 	keyDown = this.keyboardDriver.IsKeyDown(key);
		// 	this.keysDown.set(key, keyDown);
		// }
		// return keyDown;
		return this.keyboardDriver.IsKeyDown(key);
	}

	/** Returns `true` if either of the given keys are down. */
	public IsEitherKeyDown(key1: KeyCode, key2: KeyCode) {
		return this.IsKeyDown(key1) || this.IsKeyDown(key2);
	}

	/** Returns `true` if both keys are down. */
	public AreBothKeysDown(key1: KeyCode, key2: KeyCode) {
		return this.IsKeyDown(key1) && this.IsKeyDown(key2);
	}

	public Destroy() {
		this.bin.Destroy();
	}
}
