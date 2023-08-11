import { SignalPriority } from "Shared/Util/Signal";
import { KeySignal } from "./Signals/KeySignal";
export declare class KeyboardDriver {
    private readonly keyDownSignals;
    private readonly keyUpSignals;
    private readonly keyDownCounter;
    private readonly keyUpCounter;
    readonly AnyKeyDownSignal: any;
    readonly AnyKeyUpSignal: any;
    private static inst;
    private constructor();
    OnKeyDown(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority): () => void;
    OnKeyUp(key: KeyCode, callback: (event: KeySignal) => void, priority?: SignalPriority): () => void;
    IsKeyDown(key: KeyCode): boolean;
    /** **NOTE:** Internal only. Use `Keyboard` class instead. */
    static instance(): KeyboardDriver;
}
