import { Dependency } from "@easy-games/flamework-core";
import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { ClientAbilityCooldownState, ClientAbilityState } from "../AbilityUIController";

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
	private active = false;
	private boundTo: AbilityDto | undefined;
	private cooldownState: ClientAbilityCooldownState | undefined;

	public readonly bindingStateChanged = new Signal<{
		oldState: ClientAbilityState | undefined;
		newState: ClientAbilityState | undefined;
	}>();

	public constructor(private readonly slot: AbilitySlot, private enabled: boolean, private keyCode: KeyCode) {}

	/**
	 * Sets whether or not this ability binding is enabled
	 */
	public SetEnabled(enabled: boolean) {
		const oldState = this.ToAbilityState();

		this.enabled = enabled;

		this.bindingStateChanged.Fire({
			oldState,
			newState: this.ToAbilityState(),
		});
	}

	/**
	 * Sets this binding as active (used for UI effects primarily)
	 * @param active True if active
	 * @internal
	 */
	public SetActive(active: boolean) {
		const oldState = this.ToAbilityState();

		this.active = active;

		this.bindingStateChanged.Fire({
			oldState,
			newState: this.ToAbilityState(),
		});
	}

	/**
	 * Grab the ability state for the core UI
	 * @internal Core API
	 */
	public ToAbilityState(): ClientAbilityState | undefined {
		if (!this.boundTo) return;

		const ability = Dependency<AbilityRegistry>().GetAbilityById(this.boundTo.abilityId);
		if (!ability) {
			return;
		}

		const config = ability.config;

		return {
			keybinding: this.keyCode,
			name: config.name,
			icon: config.image,
			charges: 0,
			active: this.active,
			cooldown: this.cooldownState,
		};
	}

	/**
	 * Sets this ability slot's cooldown state
	 * @param cooldown The cooldown state - or undefined if no cooldown active
	 */
	public SetCooldown(cooldown: ClientAbilityCooldownState | undefined) {
		const oldState = this.ToAbilityState();

		this.cooldownState = cooldown;

		this.bindingStateChanged.Fire({
			oldState,
			newState: this.ToAbilityState(),
		});
	}

	/**
	 * Binds the given ability to this binding slot for this client
	 * @param abilityDto The ability data to bind
	 * @internal Core API
	 */
	public BindTo(abilityDto: AbilityDto): void {
		const oldState = this.ToAbilityState();

		this.boundTo = abilityDto;
		this.enabled = abilityDto.enabled;

		this.bindingStateChanged.Fire({
			oldState,
			newState: this.ToAbilityState(),
		});
	}

	/**
	 * Gets the key code bound to this ability binding
	 * @returns The key code bound to this binding
	 */
	public GetKey() {
		return this.keyCode;
	}

	/**
	 * Gets the slot of this binding
	 * @returns The slot
	 */
	public GetSlot() {
		return this.slot;
	}

	public GetEnabled() {
		return this.enabled;
	}

	public IsActive() {
		return this.active;
	}

	/**
	 * Bind a callback function to this slot
	 * @param keyboard The keyboard
	 * @param action The action
	 * @internal Core API
	 */
	public BindToAction(keyboard: Keyboard, action: BindingAction) {
		this.bin.Add(
			keyboard.OnKeyUp(this.keyCode, (event) => {
				if (event.uiProcessed) return;
				action(BindingInputState.InputEnded, this);
			}),
		);

		this.bin.Add(
			keyboard.OnKeyDown(this.keyCode, (event) => {
				if (event.uiProcessed) return;
				action(BindingInputState.InputBegan, this);
			}),
		);
	}

	/**
	 * Unbind this ability slot
	 * @internal Core API
	 */
	public Unbind() {
		this.boundTo = undefined;
		this.enabled = false;

		this.bindingStateChanged.Fire({
			oldState: this.ToAbilityState(),
			newState: undefined,
		});

		this.bin.Clean();
	}

	/**
	 * Gets the bound ability of this slot
	 * @returns The bound ability data
	 */
	public GetBound(): AbilityDto | undefined {
		return this.boundTo;
	}
}
