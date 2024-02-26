import { Keybind } from "./Keybind";

export enum KeyType {
	Primary,
	Modifier,
}

export enum ModifierKey {
	None,
	LeftShift,
	LeftControl,
	LeftAlt,
}

export enum ActionInputType {
	Keyboard,
	Mouse,
	Gamepad,
	Unbound,
	Unknown,
}

/**
 *
 */
export const ModifierKeyCodeTable: { [key in ModifierKey]: KeyCode } = {
	[ModifierKey.None]: KeyCode.None,
	[ModifierKey.LeftShift]: KeyCode.LeftShift,
	[ModifierKey.LeftControl]: KeyCode.LeftControl,
	[ModifierKey.LeftAlt]: KeyCode.LeftAlt,
};

/**
 *
 */
export const KeyCodeModifierTable: { [key in KeyCode]?: ModifierKey } = {
	[KeyCode.None]: ModifierKey.None,
	[KeyCode.LeftShift]: ModifierKey.LeftShift,
	[KeyCode.LeftControl]: ModifierKey.LeftControl,
	[KeyCode.LeftAlt]: ModifierKey.LeftAlt,
};

export class InputUtil {
	/**
	 *
	 * @param primary
	 * @returns
	 */
	public static IsPrimaryValidModifier(primary: KeyCode): boolean {
		return KeyCodeModifierTable[primary] !== undefined;
	}

	/**
	 *
	 * @param modifier
	 * @returns
	 */
	public static GetKeyCodeFromModifier(modifier: ModifierKey): KeyCode {
		return ModifierKeyCodeTable[modifier];
	}

	/**
	 *
	 * @param keyCode
	 * @returns
	 */
	public static GetModifierFromKeyCode(keyCode: KeyCode): ModifierKey | undefined {
		return KeyCodeModifierTable[keyCode];
	}

	/**
	 *
	 * @param keybind
	 */
	public static GetInputTypeFromKeybind(keybind: Keybind, keyType: KeyType): ActionInputType {
		if (keybind.IsUnset()) return ActionInputType.Unbound;
		const keyCode =
			keyType === KeyType.Primary ? keybind.primaryKey : InputUtil.GetKeyCodeFromModifier(keybind.modifierKey);
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
}
