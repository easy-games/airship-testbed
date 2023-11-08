import { Controller, OnStart } from "@easy-games/flamework-core";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";

export interface InputAction {
	BindToKey(keyCode: KeyCode): void;
	Unbind(): void;
}

class UserInputAction implements InputAction {
	private bin = new Bin();
	private boundKey: KeyCode | undefined;

	public constructor(
		private readonly controller: InputController,
		public readonly actionName: string,
		private callback: Callback,
	) {}

	public BindToKey(keyCode: KeyCode) {
		this.boundKey = keyCode;

		const keyboard = this.controller.keyboard;
		this.bin.Add(
			keyboard.OnKeyUp(keyCode, (event) => {
				this.callback();
			}),
		);
	}

	public GetKey() {
		return this.boundKey;
	}

	public Unbind() {
		this.bin.Clean();
	}

	public Destroy() {
		this.bin.Destroy();
	}
}

@Controller()
export class InputController implements OnStart {
	public readonly keyboard = new Keyboard();
	public readonly mouse = new Mouse();

	public static Action = UserInputAction;

	public OnStart(): void {
		const keyboard = new Keyboard();
		const mouse = new Mouse();
	}

	public CreateAction(actionName: string, callback: Callback): InputAction {
		return new InputController.Action(this, actionName, callback);
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputController {
	export type InputAction = typeof InputController.Action["prototype"];
}
