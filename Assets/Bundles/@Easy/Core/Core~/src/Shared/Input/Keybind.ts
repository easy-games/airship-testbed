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
	 * @returns
	 */
	public IsComplexKeybind(): boolean {
		return this.modifierKey !== ModifierKey.None;
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
