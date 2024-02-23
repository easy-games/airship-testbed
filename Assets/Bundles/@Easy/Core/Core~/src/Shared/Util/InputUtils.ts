export class InputUtils {
	public static keyCodeMap: Record<KeyCode, string | undefined> = {
		/// Unbound
		[KeyCode.None]: "None",
		/// Alpha names
		[KeyCode.A]: "A",
		[KeyCode.B]: "B",
		[KeyCode.C]: "C",
		[KeyCode.D]: "D",
		[KeyCode.E]: "E",
		[KeyCode.F]: "F",
		[KeyCode.G]: "G",
		[KeyCode.H]: "H",
		[KeyCode.I]: "I",
		[KeyCode.J]: "J",
		[KeyCode.K]: "K",
		[KeyCode.L]: "L",
		[KeyCode.M]: "M",
		[KeyCode.N]: "N",
		[KeyCode.O]: "O",
		[KeyCode.P]: "P",
		[KeyCode.Q]: "Q",
		[KeyCode.R]: "R",
		[KeyCode.S]: "S",
		[KeyCode.T]: "T",
		[KeyCode.U]: "U",
		[KeyCode.V]: "V",
		[KeyCode.W]: "W",
		[KeyCode.X]: "X",
		[KeyCode.Y]: "Y",
		[KeyCode.Z]: "Z",

		/// Numeric names
		[KeyCode.Alpha1]: "1",
		[KeyCode.Alpha2]: "2",
		[KeyCode.Alpha3]: "3",
		[KeyCode.Alpha4]: "4",
		[KeyCode.Alpha5]: "5",
		[KeyCode.Alpha6]: "6",
		[KeyCode.Alpha7]: "7",
		[KeyCode.Alpha8]: "8",
		[KeyCode.Alpha9]: "9",
		[KeyCode.Alpha0]: "0",

		// Symbolic names

		[KeyCode.BackQuote]: "`",
		[KeyCode.Minus]: "-",
		[KeyCode.Equals]: "=",
		[KeyCode.Slash]: "/",
		[KeyCode.Comma]: ",",
		[KeyCode.Period]: ".",
		[KeyCode.Backslash]: "\\",

		[KeyCode.Return]: "Return",
		[KeyCode.Escape]: "Escape",
		[KeyCode.Space]: "Space",

		// Mouse
		[KeyCode.Mouse0]: "Left Mouse",
		[KeyCode.Mouse1]: "Right Mouse",
		[KeyCode.Mouse3]: "Middle Mouse",

		// Modifier
		[KeyCode.LeftControl]: "Left Control",
		[KeyCode.LeftShift]: "Left Shift",
	};

	/**
	 * Gets the corresponding string for the given keycode (if possible)
	 *
	 * E.g. `KeyCode.Alpha1` → `"1"`, `KeyCode.A` → `"A"`, `KeyCode.Equals` → `"="`
	 * @param keyCode The keycode
	 * @returns A string for the keycode (if applicable) - otherwise `undefined`.
	 */
	public static GetStringForKeyCode(keyCode: KeyCode) {
		return this.keyCodeMap[keyCode];
	}
}
