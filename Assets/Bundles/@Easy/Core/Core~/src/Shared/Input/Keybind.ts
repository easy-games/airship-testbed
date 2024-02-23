import { InputUtil, ModifierKey } from "./InputUtil";

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
	 */
	public GetModifierKeyCode(): KeyCode {
		return InputUtil.GetKeyCodeFromModifier(this.modifierKey);
	}
}
