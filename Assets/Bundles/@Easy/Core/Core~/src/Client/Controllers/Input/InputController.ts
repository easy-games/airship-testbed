import { Controller, OnStart } from "@easy-games/flamework-core";
import { Keyboard, Mouse } from "Shared/UserInput";
import { KeySignal } from "Shared/UserInput/Drivers/Signals/KeySignal";
import { Bin } from "Shared/Util/Bin";

export enum InputState {
	Began,
	Changed,
	Ended,
}
export enum InputType {
	Keyboard,
	// Mouse,
}

abstract class Input {
	public abstract readonly inputState: InputState;
	protected constructor(public readonly inputType: InputType) {}

	public IsInputType(inputType: InputType.Keyboard): this is KeyboardInput;
	// public IsInputType(inputType: InputType.Mouse): this is MouseInput;
	public IsInputType(inputType: InputType): boolean {
		return this.inputType === inputType;
	}
}

class KeyboardInput extends Input {
	public inputType = InputType.Keyboard;
	public readonly keyCode: KeyCode;

	public constructor(public readonly inputState: InputState, event: KeySignal) {
		super(InputType.Keyboard);
		this.keyCode = event.KeyCode;
	}

	IsInputType(inputType: InputType): boolean {
		return this.inputType === inputType;
	}
}

export interface InputContextAction {
	BindToKey(...keyCodes: KeyCode[]): void;
	Unbind(): void;
}

export type ContextActionHandler = (actionName: string, input: Input) => void;

class UserInputContextAction implements InputContextAction {
	private bin = new Bin();

	public constructor(
		private readonly keyboard: Keyboard,
		public readonly actionName: string,
		private bind: ContextActionHandler,
	) {}

	public BindToKey(...keyCodes: KeyCode[]) {
		for (const keyCode of keyCodes) {
			this.bin.Add(
				this.keyboard.OnKeyUp(keyCode, (event) => {
					this.bind(this.actionName, new KeyboardInput(InputState.Ended, event));
				}),
			);

			this.bin.Add(
				this.keyboard.OnKeyDown(keyCode, (event) => {
					this.bind(this.actionName, new KeyboardInput(InputState.Began, event));
				}),
			);
		}
	}

	public Unbind() {
		this.bin.Clean();
	}

	public Destroy() {
		this.bin.Destroy();
	}
}

@Controller()
export class InputController {
	private mappedActions = new Map<string, UserInputContextAction>();

	public CreateAction(actionName: string, callback: ContextActionHandler): InputContextAction {
		const action = new UserInputContextAction(new Keyboard(), actionName, callback);
		this.mappedActions.set(actionName, action);
		return action;
	}

	public GetAction(actionName: string): InputContextAction | undefined {
		return this.mappedActions.get(actionName);
	}

	public HasAction(actionName: string): boolean {
		return this.mappedActions.has(actionName);
	}

	public UnbindAction(actionName: string) {
		const action = this.mappedActions.get(actionName);
		if (action) {
			action.Unbind();
		}
	}
}
