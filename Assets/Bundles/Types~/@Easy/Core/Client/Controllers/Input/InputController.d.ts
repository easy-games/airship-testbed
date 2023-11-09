import { KeySignal } from "../../../Shared/UserInput/Drivers/Signals/KeySignal";
export declare enum InputState {
    Began = 0,
    Changed = 1,
    Ended = 2
}
export declare enum InputType {
    Keyboard = 0
}
declare abstract class Input {
    readonly inputType: InputType;
    abstract readonly inputState: InputState;
    protected constructor(inputType: InputType);
    IsInputType(inputType: InputType.Keyboard): this is KeyboardInput;
}
declare class KeyboardInput extends Input {
    readonly inputState: InputState;
    inputType: InputType;
    readonly keyCode: KeyCode;
    constructor(inputState: InputState, event: KeySignal);
    IsInputType(inputType: InputType): boolean;
}
export interface InputContextAction {
    BindToKey(...keyCodes: KeyCode[]): void;
    Unbind(): void;
}
export type ContextActionHandler = (actionName: string, input: Input) => void;
export declare class InputController {
    private mappedActions;
    CreateAction(actionName: string, callback: ContextActionHandler): InputContextAction;
    GetAction(actionName: string): InputContextAction | undefined;
    HasAction(actionName: string): boolean;
    UnbindAction(actionName: string): void;
}
export {};
