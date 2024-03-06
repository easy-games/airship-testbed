import { ActionInputType, InputUtil, KeyType, ModifierKey } from "./InputUtil";

export class Keybind {
	/**
	 *
	 */
	public primaryKey: KeyCode;
	/**
	 *
	 */
	public modifierKey: ModifierKey;

	constructor(primaryKey: KeyCode, modifierKey = ModifierKey.None) {
		this.primaryKey = primaryKey;
		this.modifierKey = modifierKey;
	}

	/**
	 *
	 * @returns
	 */
	public IsComplexKeybind(): boolean {
		return this.modifierKey !== ModifierKey.None;
	}

	/**
	 *
	 * @returns
	 */
	public IsDesktopPeripheral(): boolean {
		const primaryInputType = InputUtil.GetInputTypeFromKeybind(this, KeyType.Primary);
		const primaryIsDesktopPeripheral =
			primaryInputType === ActionInputType.Keyboard || primaryInputType === ActionInputType.Mouse;
		if (!this.IsComplexKeybind()) {
			return primaryIsDesktopPeripheral;
		}
		const modifierInputType = InputUtil.GetInputTypeFromKeybind(this, KeyType.Modifier);
		return (
			primaryIsDesktopPeripheral &&
			(modifierInputType === ActionInputType.Keyboard || modifierInputType === ActionInputType.Mouse)
		);
	}

	/**
	 *
	 */
	public GetModifierKeyCode(): KeyCode {
		return InputUtil.GetKeyCodeFromModifier(this.modifierKey);
	}

	/**
	 *
	 * @param newKeybind
	 */
	public Update(newKeybind: Keybind): void {
		this.primaryKey = newKeybind.primaryKey;
		this.modifierKey = newKeybind.modifierKey;
	}

	/**
	 *
	 */
	public Unset(): void {
		this.primaryKey = KeyCode.None;
		this.modifierKey = ModifierKey.None;
	}

	/**
	 *
	 * @returns
	 */
	public IsUnset(): boolean {
		return this.primaryKey === KeyCode.None;
	}
}
