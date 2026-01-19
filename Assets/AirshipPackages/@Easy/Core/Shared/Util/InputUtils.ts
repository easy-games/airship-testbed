import { Asset } from "../Asset";

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

		// Numeric names
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

		// Arrow keys
		[Key.RightArrow]: "Right Arrow",
		[Key.LeftArrow]: "Left Arrow",
		[Key.UpArrow]: "Up Arrow",
		[Key.DownArrow]: "Down Arrow",

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
		[Key.Tab]: "Tab",

		// Modifier
		[Key.LeftCtrl]: "Left Control",
		[Key.LeftShift]: "Left Shift",

		// Numpad numbers
		[Key.Numpad0]: "Numpad 0",
		[Key.Numpad1]: "Numpad 1",
		[Key.Numpad2]: "Numpad 2",
		[Key.Numpad3]: "Numpad 3",
		[Key.Numpad4]: "Numpad 4",
		[Key.Numpad5]: "Numpad 5",
		[Key.Numpad6]: "Numpad 6",
		[Key.Numpad7]: "Numpad 7",
		[Key.Numpad8]: "Numpad 8",
		[Key.Numpad9]: "Numpad 9",

		// Numpad operators
		[Key.NumpadEnter]: "Numpad Enter",
		[Key.NumpadDivide]: "Numpad /",
		[Key.NumpadMultiply]: "Numpad *",
		[Key.NumpadPlus]: "Numpad +",
		[Key.NumpadMinus]: "Numpad -",
		[Key.NumpadPeriod]: "Numpad .",
		[Key.NumpadEquals]: "Numpad =",
	};

	public static mouseButtonMap: Record<MouseButton, string> = {
		[MouseButton.LeftButton]: "Left Mouse Button",
		[MouseButton.MiddleButton]: "Middle Mouse Button",
		[MouseButton.RightButton]: "Right Mouse Button",
		[MouseButton.ForwardButton]: "Forward Mouse Button",
		[MouseButton.BackButton]: "Back Mouse Button",
	};

	public static keyCodeSpritePathMap: Record<Key, string> = {
		[Key.None]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_none.png.sprite",
		[Key.A]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_a.png.sprite",
		[Key.B]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_b.png.sprite",
		[Key.C]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_c.png.sprite",
		[Key.D]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_d.png.sprite",
		[Key.E]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_e.png.sprite",
		[Key.F]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_f.png.sprite",
		[Key.G]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_g.png.sprite",
		[Key.H]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_h.png.sprite",
		[Key.I]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_i.png.sprite",
		[Key.J]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_j.png.sprite",
		[Key.K]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_k.png.sprite",
		[Key.L]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_l.png.sprite",
		[Key.M]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_m.png.sprite",
		[Key.N]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_n.png.sprite",
		[Key.O]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_o.png.sprite",
		[Key.P]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_p.png.sprite",
		[Key.Q]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_q.png.sprite",
		[Key.R]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_r.png.sprite",
		[Key.S]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_s.png.sprite",
		[Key.T]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_t.png.sprite",
		[Key.U]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_u.png.sprite",
		[Key.V]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_v.png.sprite",
		[Key.W]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_w.png.sprite",
		[Key.X]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_x.png.sprite",
		[Key.Y]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_y.png.sprite",
		[Key.Z]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_z.png.sprite",

		[Key.Digit1]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_1.png.sprite",
		[Key.Digit2]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_2.png.sprite",
		[Key.Digit3]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_3.png.sprite",
		[Key.Digit4]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_4.png.sprite",
		[Key.Digit5]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_5.png.sprite",
		[Key.Digit6]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_6.png.sprite",
		[Key.Digit7]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_7.png.sprite",
		[Key.Digit8]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_8.png.sprite",
		[Key.Digit9]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_9.png.sprite",
		[Key.Digit0]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_0.png.sprite",

		[Key.RightArrow]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_arrow_right.png.sprite",
		[Key.LeftArrow]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_arrow_left.png.sprite",
		[Key.UpArrow]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_arrow_up.png.sprite",
		[Key.DownArrow]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_arrow_down.png.sprite",

		[Key.Backquote]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_backquote.png.sprite",
		[Key.Minus]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_minus.png.sprite",
		[Key.Equals]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_equals.png.sprite",
		[Key.Slash]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_slash_forward.png.sprite",
		[Key.Comma]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_comma.png.sprite",
		[Key.Period]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_period.png.sprite",
		[Key.Backslash]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_slash_back.png.sprite",

		[Key.Enter]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_enter.png.sprite",
		[Key.Escape]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_escape.png.sprite",
		[Key.Space]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_space.png.sprite",
		[Key.Tab]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_tab.png.sprite",

		[Key.LeftCtrl]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_ctrl.png.sprite",
		[Key.LeftShift]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_shift.png.sprite",

		// Numpad numbers
		[Key.Numpad0]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_0.png.sprite",
		[Key.Numpad1]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_1.png.sprite",
		[Key.Numpad2]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_2.png.sprite",
		[Key.Numpad3]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_3.png.sprite",
		[Key.Numpad4]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_4.png.sprite",
		[Key.Numpad5]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_5.png.sprite",
		[Key.Numpad6]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_6.png.sprite",
		[Key.Numpad7]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_7.png.sprite",
		[Key.Numpad8]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_8.png.sprite",
		[Key.Numpad9]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_9.png.sprite",

		// Numpad operators
		[Key.NumpadEnter]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_enter.png.sprite",
		[Key.NumpadDivide]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_slash_forward.png.sprite",
		[Key.NumpadMultiply]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_asterisk.png.sprite",
		[Key.NumpadPlus]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_plus.png.sprite",
		[Key.NumpadMinus]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_minus.png.sprite",
		[Key.NumpadPeriod]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_period.png.sprite",
		[Key.NumpadEquals]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/keyboard_equals.png.sprite",
	};

	public static mouseButtonSpritePathMap: Record<MouseButton, string> = {
		[MouseButton.LeftButton]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/mouse_left.png.sprite",
		[MouseButton.MiddleButton]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/mouse_scroll.png.sprite",
		[MouseButton.RightButton]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/mouse_right.png.sprite",
		[MouseButton.ForwardButton]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/mouse_forward.png.sprite",
		[MouseButton.BackButton]: "Assets/AirshipPackages/@Easy/Core/Prefabs/UI/InputIcons/mouse_back.png.sprite",
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

	public static GetSpriteForKeyCode(key: Key, getOutlineVersion?: boolean): Sprite | undefined {
		let path = this.keyCodeSpritePathMap[key] ?? "";
		if (getOutlineVersion) {
			const splitStringArray = string.split(path, ".");
			path = splitStringArray[0] + "_outline.png.sprite";
		}
		if (path) {
			return Asset.LoadAssetIfExists<Sprite>(path);
		}
		return undefined;
	}

	public static GetSpriteForMouseButton(mouseButton: MouseButton, getOutlineVersion?: boolean): Sprite | undefined {
		let path = this.mouseButtonSpritePathMap[mouseButton] ?? "";
		if (getOutlineVersion) {
			const splitStringArray = string.split(path, ".");
			path = splitStringArray[0] + "_outline.png.sprite";
		}
		if (path) {
			return Asset.LoadAssetIfExists<Sprite>(path);
		}
		return undefined;
	}
}
