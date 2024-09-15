import { InputUtils } from "../Util/InputUtils";
import { ActionInputType, InputUtil, KeyType, ModifierKey } from "./InputUtil";

export interface KeyBindingConfig {
	isKeyBinding: true;
	key: Key;
	modifierKey: ModifierKey;
}

export interface MouseBindingConfig {
	isKeyBinding: false;
	mouseButton: MouseButton;
	modifierKey: ModifierKey;
}

type BindingConfig = KeyBindingConfig | MouseBindingConfig;

export class Binding {
	public static Key(key: Key = Key.None, modifierKey?: ModifierKey) {
		return new Binding({
			isKeyBinding: true,
			key,
			modifierKey: modifierKey ?? ModifierKey.None,
		});
	}

	public static MouseButton(mouseButton: MouseButton, modifierKey?: ModifierKey) {
		return new Binding({
			isKeyBinding: false,
			mouseButton,
			modifierKey: modifierKey ?? ModifierKey.None,
		});
	}

	public static Clone(other: Binding) {
		return new Binding(table.clone(other.config));
	}

	public static AreEqual(a: Binding, b: Binding) {
		if (a.config.isKeyBinding && b.config.isKeyBinding) {
			return a.config.key === b.config.key && a.config.modifierKey === b.config.modifierKey;
		} else if (!a.config.isKeyBinding && !b.config.isKeyBinding) {
			return a.config.mouseButton === b.config.mouseButton && a.config.modifierKey === b.config.modifierKey;
		}

		return false;
	}

	private constructor(public config: BindingConfig) {}

	public Update(binding: Binding) {
		this.config = table.clone(binding.config);
	}

	public IsKeyBinding() {
		return this.config.isKeyBinding;
	}

	public IsMouseButtonBinding() {
		return !this.config.isKeyBinding;
	}

	public Unset(): void {
		this.config = {
			isKeyBinding: true,
			key: Key.None,
			modifierKey: ModifierKey.None,
		};
	}

	public IsUnset(): boolean {
		return this.config.isKeyBinding && this.config.key === Key.None;
	}

	public IsComplexBinding() {
		return this.config.modifierKey !== ModifierKey.None;
	}

	public IsDesktopPeripheral(): boolean {
		const primaryInputType = InputUtil.GetInputTypeFromBinding(this, KeyType.Primary);
		const primaryIsDesktopPeripheral =
			primaryInputType === ActionInputType.Keyboard || primaryInputType === ActionInputType.Mouse;
		if (!this.IsComplexBinding()) {
			return primaryIsDesktopPeripheral;
		}
		const modifierInputType = InputUtil.GetInputTypeFromBinding(this, KeyType.Modifier);
		return (
			primaryIsDesktopPeripheral &&
			(modifierInputType === ActionInputType.Keyboard || modifierInputType === ActionInputType.Mouse)
		);
	}

	/**
	 * Returns this binding's `ModifierKey` as it's `Key` equivalent.
	 *
	 * @returns Binding's modifier key as it's `Key` equivalent
	 */
	public GetModifierAsKey() {
		return InputUtil.GetKeyFromModifier(this.config.modifierKey);
	}

	/**
	 * Returns this binding's `ActionInputType`. `ActionInputType` is based on the binding's
	 * primary key. If the key is a mouse button, this returns `ActionInputType.Mouse`, if
	 * it's a keyboard key, `ActionInputType.Keyboard`, and so forth.
	 *
	 * @returns The `ActionInputType` that corresponds to this binding.
	 */
	public GetInputType() {
		return InputUtil.GetInputTypeFromBinding(this, KeyType.Primary);
	}

	/**
	 * Returns the primary key for this binding.
	 *
	 * @returns `Key` for this binding if it exists, otherwise undefined.
	 */
	public GetKey(): Key | undefined {
		return (this.config as KeyBindingConfig).key ?? Key.None;
	}

	/**
	 * Gets the mouse button for this binding.
	 *
	 * @returns `MouseButton` for this binding if it exists, otherwise undefined.
	 */
	public GetMouseButton(): MouseButton | undefined {
		return (this.config as MouseBindingConfig).mouseButton;
	}

	/**
	 * Gets the display name for the binding, for example: "Left Shift + S" or "Left Mouse Button"
	 *
	 * @returns Display name for the binding.
	 */
	public GetDisplayName(): string | undefined {
		if (this.IsUnset()) return undefined;

		const key = this.GetKey();
		let result = "";
		if (key !== undefined) {
			result = `${InputUtils.GetStringForKeyCode(key)}`;
		}
		const mouseButton = this.GetMouseButton();
		if (mouseButton !== undefined) {
			result = `${InputUtils.GetStringForMouseButton(mouseButton)}`;
		}

		const modifierKey = this.GetModifierAsKey();
		if (modifierKey !== undefined && modifierKey !== Key.None) {
			result = `${InputUtils.GetStringForKeyCode(modifierKey)} + ${result}`;
		}
		return result;
	}
}
