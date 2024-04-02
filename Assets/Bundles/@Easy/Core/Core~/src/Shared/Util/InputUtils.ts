export class InputUtils {
	public static keyCodeMap: Record<Key, string> = {
		/// Unbound
		[Key.None]: "",
		/// Alpha names
		[Key.A]: "A",
		[Key.B]: "B",
		[Key.C]: "C",
		[Key.D]: "D",
		[Key.E]: "E",
		[Key.F]: "F",
		[Key.G]: "G",
		[Key.H]: "H",
		[Key.I]: "I",
		[Key.J]: "J",
		[Key.K]: "K",
		[Key.L]: "L",
		[Key.M]: "M",
		[Key.N]: "N",
		[Key.O]: "O",
		[Key.P]: "P",
		[Key.Q]: "Q",
		[Key.R]: "R",
		[Key.S]: "S",
		[Key.T]: "T",
		[Key.U]: "U",
		[Key.V]: "V",
		[Key.W]: "W",
		[Key.X]: "X",
		[Key.Y]: "Y",
		[Key.Z]: "Z",

		/// Numeric names
		[Key.Digit1]: "1",
		[Key.Digit2]: "2",
		[Key.Digit3]: "3",
		[Key.Digit4]: "4",
		[Key.Digit5]: "5",
		[Key.Digit6]: "6",
		[Key.Digit7]: "7",
		[Key.Digit8]: "8",
		[Key.Digit9]: "9",
		[Key.Digit0]: "0",

		// Symbolic names

		[Key.Backquote]: "`",
		[Key.Minus]: "-",
		[Key.Equals]: "=",
		[Key.Slash]: "/",
		[Key.Comma]: ",",
		[Key.Period]: ".",
		[Key.Backslash]: "\\",

		[Key.Enter]: "Enter",
		[Key.Escape]: "Escape",
		[Key.Space]: "Space",

		// Modifier
		[Key.LeftCtrl]: "Left Control",
		[Key.LeftShift]: "Left Shift",
	};

	public static mouseButtonMap: Record<MouseButton, string> = {
		[MouseButton.LeftButton]: "Left Button",
		[MouseButton.MiddleButton]: "Middle Button",
		[MouseButton.RightButton]: "Right Button",
	};

	/**
	 * Gets the corresponding string for the given key (if possible).
	 *
	 * E.g. `Key.Digit1` → `"1"`, `Key.A` → `"A"`, `Key.Equals` → `"="`.
	 * @param key The key
	 * @returns A string for the key (if applicable) - otherwise `undefined`.
	 */
	public static GetStringForKeyCode(key: Key) {
		return this.keyCodeMap[key];
	}

	/**
	 * Gets the corresponding string for the given mouse button (if possible).
	 *
	 * E.g. `MouseButton.LeftButton` → `"Left Button"`.
	 * @param mouseButton The mouse button
	 * @returns A string for the mouse button (if applicable) - otherwise `undefined`.
	 */
	public static GetStringForMouseButton(mouseButton: MouseButton) {
		return this.mouseButtonMap[mouseButton];
	}
}
