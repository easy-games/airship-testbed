import { OnStart } from "../Flamework";
import { KeySignal } from "../UserInput/Drivers/Signals/KeySignal";
import { Signal } from "../Util/Signal";
import { InputActionSchema } from "./InputAction";
import { Keybind } from "./Keybind";
export declare class AirshipInputSingleton implements OnStart {
    /**
     *
     */
    private inputDevice;
    /**
     *
     */
    private actionTable;
    /**
     *
     */
    private actionUnbound;
    /**
     *
     */
    private actionDownSignals;
    /**
     *
     */
    private actionUpSignals;
    /**
     *
     */
    private actionDownState;
    /**
     *
     */
    private complexActionLastDown;
    constructor();
    OnStart(): void;
    /**
     *
     * @param actions
     */
    CreateActions(actions: InputActionSchema[]): void;
    /**
     *
     * @param name
     * @param keybind
     * @param category
     */
    CreateAction(name: string, keybind: Keybind, category?: string): void;
    /**
     *
     * @param name
     * @returns
     */
    OnDown(name: string): Signal<KeySignal>;
    /**
     *
     * @param name
     * @returns
     */
    OnUp(name: string): Signal<KeySignal>;
    /**
     *
     * @param name
     * @returns
     */
    IsDown(name: string): boolean;
    /**
     *
     * @param name
     */
    IsUp(name: string): boolean;
    /**
     *
     * @param action
     */
    private AddActionToTable;
    /**
     *
     * @param action
     */
    private CreateActionListeners;
    /**
     *
     * @param signalIndices
     * @param signals
     */
    private ClearInactiveSignals;
    /**
     *
     * @param newAction
     */
    private UnbindActions;
}
