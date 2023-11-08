import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { Keyboard } from "Shared/UserInput";
import { KeySignal } from "Shared/UserInput/Drivers/Signals/KeySignal";
import { Bin } from "Shared/Util/Bin";

export enum BindingInputState {
	InputBegan,
	InputEnded,
}

export class BindingInput {
	public constructor(readonly state: BindingInputState, readonly keyCode: KeyCode) {}
}

export type BindingAction = (inputState: BindingInputState, binding: AbilityBinding) => void;

export class AbilityBinding {
	private bin = new Bin();
	private primaryId: string | undefined;

	public constructor(private readonly slot: AbilitySlot, private enabled: boolean, private keyCode: KeyCode) {}

	public SetEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	public BindToId(abilityId: string): void {
		this.primaryId = abilityId;
	}

	public GetKey() {
		return this.keyCode;
	}

	public GetSlot() {
		return this.slot;
	}

	public GetEnabled() {
		return this.enabled;
	}

	public BindToAction(keyboard: Keyboard, action: BindingAction) {
		this.bin.Add(
			keyboard.OnKeyUp(this.keyCode, (event) => {
				action(BindingInputState.InputEnded, this);
			}),
		);

		this.bin.Add(
			keyboard.OnKeyDown(this.keyCode, (event) => {
				action(BindingInputState.InputBegan, this);
			}),
		);
	}

	public Unbind() {
		this.bin.Clean();
		this.primaryId = undefined;
		this.enabled = false;
	}

	public GetBoundId(): string | undefined {
		return this.primaryId;
	}
}
