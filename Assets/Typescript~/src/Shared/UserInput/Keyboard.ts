import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { SignalProxy } from "Shared/Util/SignalProxy";
import { KeyboardDriver } from "./Drivers/KeyboardDriver";
import { KeySignal } from "./Drivers/Signals/KeySignal";

export class Keyboard {
	private readonly bin = new Bin();
	private readonly keyboardDriver = KeyboardDriver.instance();
	private readonly keysDown = new Map<Key, boolean>();

	/** The `KeyDown` signal fires any time a key is pressed down. */
	public readonly KeyDown: Signal<[event: KeySignal]>;

	/** The `KeyUp` signal fires any time a key is released. */
	public readonly KeyUp = new Signal<KeySignal>();

	constructor() {
		this.KeyDown = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.KeyDown));
		this.bin.Add(this.KeyDown);
		this.bin.Add(this.KeyUp);
		this.bin.Connect(this.keyboardDriver.KeyDown, (key) => {
			this.keysDown.set(key.Key, true);
			this.KeyDown.Fire(key);
		});
		this.bin.Connect(this.keyboardDriver.KeyUp, (key) => {
			this.keysDown.set(key.Key, false);
			this.KeyUp.Fire(key);
		});
	}

	/** Returns `true` if the given key is down. */
	public IsKeyDown(key: Key) {
		let keyDown = this.keysDown.get(key);
		if (keyDown === undefined) {
			keyDown = this.keyboardDriver.IsKeyDown(key);
			this.keysDown.set(key, keyDown);
		}
		return keyDown;
	}

	/** Returns `true` if either of the given keys are down. */
	public IsEitherKeyDown(key1: Key, key2: Key) {
		return this.IsKeyDown(key1) || this.IsKeyDown(key2);
	}

	/** Returns `true` if both keys are down. */
	public AreBothKeysDown(key1: Key, key2: Key) {
		return this.IsKeyDown(key1) && this.IsKeyDown(key2);
	}

	public Destroy() {
		this.bin.Destroy();
	}
}
