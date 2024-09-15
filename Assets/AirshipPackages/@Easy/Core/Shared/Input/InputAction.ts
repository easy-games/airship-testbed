import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Airship } from "../Airship";
import { Game } from "../Game";
import { FormatUtil } from "../Util/FormatUtil";
import { Binding } from "./Binding";
import { ModifierKey } from "./InputUtil";

export interface SerializableAction {
	/**
	 * The name of action.
	 */
	name: string;
	/**
	 * The action's primary key, `Key.None` indicates an unset action, or a mouse-based
	 * action.
	 */
	primaryKey: Key;
	/**
	 * The action's modifier key, `ModifierKey.None` indicates that this action has **no**
	 * modifier key.
	 */
	modifierKey: ModifierKey;
	/**
	 * The action's mouse button. A value of `-1` indicates that this action is **not** a mouse-based
	 * action.
	 */
	mouseButton: MouseButton;
	/**
	 * The category this action belongs to.
	 */
	category: string;
}

export interface InputActionSchema {
	/**
	 * The name of this action.
	 */
	name: string;
	/**
	 * The binding associated with this action.
	 */
	binding: Binding;
	/**
	 * The secondary binding, if it exists.
	 */
	secondaryBinding?: Binding;
	/**
	 * The category this action is associated with, if it exists.
	 */
	category?: string;
}

export enum InputActionContext {
	/**
	 * Indicates action exists in the Game context.
	 */
	Game,
	/**
	 * Indicates action exists in the Protected context.
	 */
	Protected,
}

export class InputActionConfig {
	/**
	 * The action's secondary binding, if it exists.
	 */
	secondaryBinding?: Binding;
	/**
	 * The category action is assigned to.
	 */
	category?: string;
}

export class InputAction {
	/**
	 * Auto-incrementing action id counter.
	 */
	public static InputActionId = 0;
	/**
	 * The action's id.
	 */
	public id: number;
	/**
	 * The context in which action exists.
	 */
	public context: InputActionContext;
	/**
	 * Whether or not action is a core action.
	 */
	public isCore = false;
	/**
	 * The name associated with action.
	 */
	public name: string;
	/**
	 * The _original_ binding associated with this action.
	 */
	public defaultBinding: Binding;
	/**
	 *  The _current_ binding associated with this action.
	 */
	public binding: Binding;
	/**
	 * The category **this** binding belongs to.
	 */
	public category: string;
	/**
	 * Whether or not this is a secondary binding.
	 */
	public isSecondary: boolean;
	/**
	 * The capitalized version of this binding's name.
	 */
	private properlyCapitalizedName: string;

	constructor(name: string, binding: Binding, isSecondary: boolean, category = "General", isCore = false) {
		this.id = InputAction.InputActionId++;
		this.name = name.lower();
		this.properlyCapitalizedName = name;
		this.isCore = isCore;
		this.defaultBinding = ObjectUtils.deepCopy(binding);
		this.isSecondary = isSecondary;
		this.binding = binding;
		this.context = Game.IsProtectedLuauContext() ? InputActionContext.Protected : InputActionContext.Game;
		this.category = category;
	}

	/**
	 * Updates action's binding to match provided binding.
	 *
	 * @param newKeybind The new `Binding`.
	 */
	public UpdateBinding(newBinding: Binding): void {
		this.binding.Update(newBinding);
		Airship.Input.onActionBound.Fire(this);
	}

	/**
	 * Unsets this action's binding.
	 */
	public UnsetBinding(): void {
		this.binding.Unset();
		Airship.Input.onActionUnbound.Fire(this);
	}

	/**
	 * Resets this action's binding to it's default binding. The default binding
	 * is the binding that was set before any modifications were made to this action
	 * through the keybind menu.
	 */
	public ResetBinding(): void {
		this.binding.Update(this.defaultBinding);
		Airship.Input.onActionBound.Fire(this);
	}

	/**
	 * Returns whether or not this action's binding is a desktop peripheral. A
	 * desktop peripheral is a keyboard **or** a mouse.
	 *
	 * @returns Whether or not this is a desktop peripheral.
	 */
	public IsDesktopPeripheral(): boolean {
		return this.binding.IsDesktopPeripheral();
	}

	/**
	 * Returns whether or not this action's binding is complex. A binding is complex
	 * if it includes a `ModifierKey`.
	 *
	 * @returns Whether or not this action's binding is complex.
	 */
	public IsComplexBinding(): boolean {
		return this.binding.IsComplexBinding();
	}

	/**
	 * Returns whether or not the bindings associated with this input action and the provided
	 * input action are equal.
	 *
	 * @param otherAction A `InputAction`.
	 * @returns Whether or not the bindings associated with this `InputAction` and `otherAction`
	 * are equal.
	 */
	public DoBindingsMatch(otherAction: InputAction): boolean {
		return Binding.AreEqual(this.binding, otherAction.binding);
	}

	/**
	 * Returns a serializable representation of this `InputAction`. Call `json.encode` on the
	 * result of this function for a valid JSON representation of this `InputAction`.
	 *
	 * @returns A serializable object that represents this `InputAction`.
	 */
	public GetSerializable(): SerializableAction {
		return {
			name: this.name,
			primaryKey: this.binding.config.isKeyBinding ? this.binding.config.key : Key.None,
			modifierKey: this.binding.config.modifierKey,
			mouseButton: !this.binding.config.isKeyBinding ? this.binding.config.mouseButton : (-1 as MouseButton),
			category: this.category,
		};
	}

	/** For an action of name DashJump this will return Dash Jump */
	public GetDisplayName() {
		return FormatUtil.ToDisplayFormat(this.properlyCapitalizedName);
	}
}
