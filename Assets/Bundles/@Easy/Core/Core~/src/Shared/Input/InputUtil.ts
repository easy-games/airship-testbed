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
}
