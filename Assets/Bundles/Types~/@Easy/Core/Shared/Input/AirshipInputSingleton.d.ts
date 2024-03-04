import { OnStart } from "../Flamework";
import { KeySignal } from "../UserInput/Drivers/Signals/KeySignal";
import { Signal } from "../Util/Signal";
import { InputAction, InputActionConfig, InputActionSchema } from "./InputAction";
import { ActionInputType } from "./InputUtil";
import { Keybind } from "./Keybind";
export declare class AirshipInputSingleton implements OnStart {
    /**
     *
     */
    onActionBound: Signal<InputAction>;
    /**
     *
     */
    onActionUnbound: Signal<InputAction>;
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
     * Whether or not creating a duplicate keybind should immediately unbind matching keybinds.
     */
    unsetOnDuplicateKeybind: boolean;
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
    CreateAction(name: string, keybind: Keybind, config?: InputActionConfig): void;
    /**
     *
     * @param name
     * @returns
     */
    GetActions(name: string): InputAction[];
    /**
     *
     * @param name
     * @param inputType
     * @returns
     */
    GetActionByInputType(name: string, inputType: ActionInputType): InputAction | undefined;
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
     * @returns
     */
    GetKeybinds(): InputAction[];
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
     * @param action
     */
    private UnsetDuplicateKeybinds;
    /**
     *
     * @param signalIndices
     * @param signals
     */
    private ClearInactiveSignals;
}
