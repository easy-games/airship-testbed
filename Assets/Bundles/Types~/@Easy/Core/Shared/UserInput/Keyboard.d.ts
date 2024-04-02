import { Signal, SignalPriority } from "../Util/Signal";
import { KeySignal } from "./Drivers/Signals/KeySignal";
export declare class Keyboard {
    static readonly global: Keyboard;
    private readonly bin;
    private readonly keyboardDriver;
    private readonly keyUpDownDisconnects;
    /**
     * The `AnyKeyDown` signal will fire when any already-registered key is pressed. This means that
     * it will only fire for keys that are already being listened for via `OnKeyDown`.
     * @deprecated Use `keyDown` instead.
     */
    readonly anyKeyDown: Signal<[event: KeySignal]>;
    /**
     * The `AnyKeyUp` signal will fire when any already-registered key is released. This means that
     * it will only fire for keys that are already being listened for via `OnKeyUp`.
     * @deprecated Use `keyUp` instead.
     */
    readonly anyKeyUp: Signal<[event: KeySignal]>;
    /**
     * Fired when a key is pressed down.
     */
    readonly keyDown: Signal<[event: KeySignal]>;
    /**
     * Fired when a key is released.
     */
    readonly keyUp: Signal<[event: KeySignal]>;
    constructor();
    private TrackDisconnect;
    OnKeyDown(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority): () => void;
    OnKeyUp(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority): () => void;
    /** Returns `true` if the given key is down. */
    IsKeyDown(key: Key): boolean;
    /** Returns `true` if either of the given keys are down. */
    IsEitherKeyDown(key1: Key, key2: Key): boolean;
    /** Returns `true` if both keys are down. */
    AreBothKeysDown(key1: Key, key2: Key): boolean;
    Destroy(): void;
}
