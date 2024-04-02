import { Signal, SignalPriority } from "../../Util/Signal";
import { KeySignal } from "./Signals/KeySignal";
export declare class KeyboardDriver {
    readonly anyKeyDownSignal: Signal<[key: KeySignal]>;
    readonly anyKeyUpSignal: Signal<[key: KeySignal]>;
    readonly keyDown: Signal<[key: KeySignal]>;
    readonly keyUp: Signal<[key: KeySignal]>;
    private readonly inputBridge;
    private static inst;
    private constructor();
    OnKeyDown(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority): () => void;
    OnKeyUp(key: Key, callback: (event: KeySignal) => void, priority?: SignalPriority): () => void;
    IsKeyDown(key: Key): boolean;
    /** **NOTE:** Internal only. Use `Keyboard` class instead. */
    static Instance(): KeyboardDriver;
}
