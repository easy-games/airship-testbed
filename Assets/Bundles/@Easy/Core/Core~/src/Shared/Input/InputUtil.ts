import { Binding } from "./Binding";

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
export const ModifierKeyCodeTable: { [key in ModifierKey]: Key } = {
	[ModifierKey.None]: Key.None,
	[ModifierKey.LeftShift]: Key.LeftShift,
	[ModifierKey.LeftControl]: Key.LeftCtrl,
	[ModifierKey.LeftAlt]: Key.LeftAlt,
};

/**
 *
 */
export const KeyCodeModifierTable: { [key in Key]?: ModifierKey } = {
	[Key.None]: ModifierKey.None,
	[Key.LeftShift]: ModifierKey.LeftShift,
	[Key.LeftCtrl]: ModifierKey.LeftControl,
	[Key.LeftAlt]: ModifierKey.LeftAlt,
};

export class InputUtil {
	/**
	 *
	 * @param primary
	 * @returns
	 */
	public static IsPrimaryValidModifier(primary: Key): boolean {
		return KeyCodeModifierTable[primary] !== undefined;
	}

	/**
	 *
	 * @param modifier
	 * @returns
	 */
	public static GetKeyFromModifier(modifier: ModifierKey): Key {
		return ModifierKeyCodeTable[modifier];
	}

	/**
	 *
	 * @param keyCode
	 * @returns
	 */
	public static GetModifierFromKey(key: Key): ModifierKey | undefined {
		return KeyCodeModifierTable[key];
	}

	/**
	 *
	 * @param keybind
	 */
	public static GetInputTypeFromBinding(binding: Binding, keyType: KeyType): ActionInputType {
		if (binding.IsUnset()) return ActionInputType.Unbound;

		if (binding.config.isKeyBinding) {
			return ActionInputType.Keyboard;
		} else {
			return ActionInputType.Mouse;
		}
	}
}
