import ObjectUtils from "@easy-games/unity-object-utils";
import { Airship } from "../Airship";
import { ActionInputType, InputUtil, KeyType, ModifierKey } from "./InputUtil";
import { Keybind } from "./Keybind";

export interface SerializableAction {
	/**
	 *
	 */
	name: string;
	/**
	 *
	 */
	primaryKey: KeyCode;
	/**
	 *
	 */
	modifierKey: ModifierKey;
	/**
	 *
	 */
	category: string;
}

export interface InputActionSchema {
	/**
	 *
	 */
	name: string;
	/**
	 *
	 */
	keybind: Keybind;
	/**
	 *
	 */
	secondaryKeybind?: Keybind;
	/**
	 *
	 */
	category?: string;
}

export class InputActionConfig {
	/**
	 *
	 */
	secondaryKeybind?: Keybind;
	/**
	 *
	 */
	category?: string;
}

export class InputAction {
	/**
	 *
	 */
	public static inputActionId = 0;
	/**
	 *
	 */
	public id: number;
	/**
	 *
	 */
	public name: string;
	/**
	 *
	 */
	public defaultKeybind: Keybind;
	/**
	 *
	 */
	public keybind: Keybind;
	/**
	 *
	 */
	public category: string;
	/**
	 *
	 */
	public isSecondary: boolean;

	constructor(name: string, keybind: Keybind, isSecondary: boolean, category = "General") {
		this.id = InputAction.inputActionId++;
		this.name = name;
		this.defaultKeybind = ObjectUtils.deepCopy(keybind);
		this.isSecondary = isSecondary;
		this.keybind = keybind;
		this.category = category;
	}

	/**
	 *
	 * @param newKeybind
	 */
	public UpdateKeybind(newKeybind: Keybind): void {
		// TODO: Some validation here, maybe?
		this.keybind.Update(newKeybind);
		Airship.input.onActionBound.Fire(this);
	}

	/**
	 *
	 */
	public UnsetKeybind(): void {
		this.keybind.Unset();
		Airship.input.onActionUnbound.Fire(this);
	}

	/**
	 *
	 */
	public ResetKeybind(): void {
		this.keybind.Update(this.defaultKeybind);
		Airship.input.onActionBound.Fire(this);
	}

	/**
	 *
	 * @returns
	 */
	public IsDesktopPeripheral(): boolean {
		const primaryInputType = InputUtil.GetInputTypeFromKeybind(this.defaultKeybind, KeyType.Primary);
		const primaryIsDesktopPeripheral =
			primaryInputType === ActionInputType.Keyboard || primaryInputType === ActionInputType.Mouse;
		if (!this.IsComplexKeybind()) {
			return primaryIsDesktopPeripheral;
		}
		const modifierInputType = InputUtil.GetInputTypeFromKeybind(this.defaultKeybind, KeyType.Modifier);
		return (
			primaryIsDesktopPeripheral &&
			(modifierInputType === ActionInputType.Keyboard || modifierInputType === ActionInputType.Mouse)
		);
	}

	/**
	 *
	 * @returns
	 */
	public IsComplexKeybind(): boolean {
		return this.keybind.IsComplexKeybind();
	}

	/**
	 *
	 * @param otherAction
	 * @returns
	 */
	public DoKeybindsMatch(otherAction: InputAction): boolean {
		return (
			this.keybind.primaryKey === otherAction.keybind.primaryKey &&
			this.keybind.modifierKey === otherAction.keybind.modifierKey
		);
	}

	/**
	 *
	 * @returns
	 */
	public Serialize(): SerializableAction {
		return {
			name: this.name,
			primaryKey: this.keybind.primaryKey,
			modifierKey: this.keybind.modifierKey,
			category: this.category,
		};
	}
}
