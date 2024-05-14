import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { SignalProxy } from "@Easy/Core/Shared/Util/SignalProxy";
import { KeyboardDriver } from "./Drivers/KeyboardDriver";
import { KeySignal } from "./Drivers/Signals/KeySignal";

export class Keyboard {
	public static readonly global = new Keyboard();

	private readonly bin = new Bin();
	private readonly keyboardDriver = KeyboardDriver.Instance();

	private readonly keyUpDownDisconnects: Callback[] = [];

	/**
	 * The `AnyKeyDown` signal will fire when any already-registered key is pressed. This means that
	 * it will only fire for keys that are already being listened for via `OnKeyDown`.
	 * @deprecated Use `keyDown` instead.
	 */
	public readonly anyKeyDown: Signal<[event: KeySignal]>;

	/**
	 * The `AnyKeyUp` signal will fire when any already-registered key is released. This means that
	 * it will only fire for keys that are already being listened for via `OnKeyUp`.
	 * @deprecated Use `keyUp` instead.
	 */
	public readonly anyKeyUp: Signal<[event: KeySignal]>;

	/**
	 * Fired when a key is pressed down.
	 */
	public readonly keyDown: Signal<[event: KeySignal]>;

	/**
	 * Fired when a key is released.
	 */
	public readonly keyUp: Signal<[event: KeySignal]>;

	constructor() {
		this.anyKeyDown = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.anyKeyDownSignal));
		this.anyKeyUp = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.anyKeyUpSignal));
		this.keyDown = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.keyDown));
		this.keyUp = this.bin.Add(new SignalProxy<[KeySignal]>(this.keyboardDriver.keyUp));
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

	public OnKeyDown(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const disconnect = this.keyboardDriver.OnKeyDown(key, callback, priority);
		return this.TrackDisconnect(disconnect);
	}

	public OnKeyUp(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority) {
		const disconnect = this.keyboardDriver.OnKeyUp(key, callback, priority);
		return this.TrackDisconnect(disconnect);
	}

	/** Returns `true` if the given key is down. */
	public IsKeyDown(key: Key) {
		return this.keyboardDriver.IsKeyDown(key);
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
		this.bin.Clean();
	}
}
