/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Keyboard, Mouse } from "../../../Shared/UserInput";
export interface InputAction {
    BindToKey(keyCode: KeyCode): void;
    Unbind(): void;
}
declare class UserInputAction implements InputAction {
    private readonly controller;
    readonly actionName: string;
    private callback;
    private bin;
    private boundKey;
    constructor(controller: InputController, actionName: string, callback: Callback);
    BindToKey(keyCode: KeyCode): void;
    GetKey(): KeyCode | undefined;
    Unbind(): void;
    Destroy(): void;
}
export declare class InputController implements OnStart {
    readonly keyboard: Keyboard;
    readonly mouse: Mouse;
    static Action: typeof UserInputAction;
    OnStart(): void;
    CreateAction(actionName: string, callback: Callback): InputAction;
}
export declare namespace InputController {
    type InputAction = typeof InputController.Action["prototype"];
}
export {};
