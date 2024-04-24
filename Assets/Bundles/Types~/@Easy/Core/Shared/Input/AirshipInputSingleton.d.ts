import { OnStart } from "../Flamework";
import { Preferred as PreferredControls } from "../UserInput";
import { Signal } from "../Util/Signal";
import { Binding } from "./Binding";
import { InputAction, InputActionConfig, InputActionSchema } from "./InputAction";
import { InputActionEvent } from "./InputActionEvent";
import { ActionInputType } from "./InputUtil";
import { MobileButtonConfig } from "./Mobile/MobileButton";
import ProximityPrompt from "./ProximityPrompts/ProximityPrompt";
export declare class AirshipInputSingleton implements OnStart {
    /**
     * Whether or not creating a duplicate keybind should immediately unbind matching keybinds.
     */
    unsetOnDuplicateKeybind: boolean;
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
    private keyboard;
    /**
     *
     */
    private mouse;
    /**
     *
     */
    private controlManager;
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
     *
     */
    private mobileControlsContainer;
    /**
     *
     */
    private mobileButtonPrefab;
    /**
     *
     */
    private actionToMobileButtonTable;
    /**
     *
     */
    preferredControls: PreferredControls;
    constructor();
    OnStart(): void;
    /**
     *
     * @param actionName
     * @param parent
     * @param config
     * @returns
     */
    CreateProximityPrompt(actionName: string, parent?: Transform, config?: {
        primaryText?: string;
        secondaryText?: string;
        maxRange?: number;
    }): ProximityPrompt;
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
    CreateAction(name: string, binding: Binding, config?: InputActionConfig): void;
    /**
     *
     */
    private CreateMobileControlCanvas;
    /**
     *
     * @param name
     * @param anchoredPosition
     * @param config
     */
    CreateMobileButton(name: string, anchoredPosition: Vector2, config?: MobileButtonConfig): void;
    /**
     *
     * @param name
     */
    HideMobileButtons(name: string): void;
    /**
     *
     * @param name
     */
    ShowMobileButtons(name: string): void;
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
    OnDown(name: string): Signal<[event: InputActionEvent]>;
    /**
     *
     * @param name
     * @returns
     */
    OnUp(name: string): Signal<[event: InputActionEvent]>;
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
    GetBindings(): InputAction[];
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
    private UnsetDuplicateBindings;
    /**
     *
     * @param signalIndices
     * @param signals
     */
    private ClearInactiveSignals;
}
