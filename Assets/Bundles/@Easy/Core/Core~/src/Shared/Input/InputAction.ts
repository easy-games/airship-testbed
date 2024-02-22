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
	category?: string;
}

export class InputAction {
	/**
	 *
	 */
	public name: string;
	/**
	 *
	 */
	public keybind: Keybind;
	/**
	 *
	 */
	public category: string;

	constructor(name: string, keybind: Keybind, category = "General") {
		this.name = name;
		this.keybind = keybind;
		this.category = category;
	}

	/**
	 *
	 * @returns
	 */
	public GetInputType(keyType: KeyType): ActionInputType {
		const keyCode =
			keyType === KeyType.Primary
				? this.keybind.primaryKey
				: InputUtil.GetKeyCodeFromModifier(this.keybind.modifierKey);
		if (keyCode >= 8 && keyCode <= 319) {
			return ActionInputType.Keyboard;
		}
		if (keyCode >= 321 && keyCode <= 329) {
			return ActionInputType.Mouse;
		}
		if (keyCode >= 330 && keyCode <= 509) {
			return ActionInputType.Gamepad;
		}
		return ActionInputType.Unknown;
	}

	/**
	 *
	 * @returns
	 */
	public IsDesktopPeripheral(): boolean {
		const primaryInputType = this.GetInputType(KeyType.Primary);
		const primaryIsDesktopPeripheral =
			primaryInputType === ActionInputType.Keyboard || primaryInputType === ActionInputType.Mouse;
		if (!this.IsComplexKeybind()) {
			return primaryIsDesktopPeripheral;
		}
		const modifierInputType = this.GetInputType(KeyType.Modifier);
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
		return this.keybind.modifierKey !== ModifierKey.None;
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
