import { InputUtils } from "../Util/InputUtils";
import { ActionInputType, InputUtil, KeyType, ModifierKey } from "./InputUtil";

interface KeyBindingConfig {
	isKeyBinding: true;
	key: Key;
	modifierKey: ModifierKey;
}

interface MouseBindingConfig {
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

	public GetModifierKey() {
		return InputUtil.GetKeyFromModifier(this.config.modifierKey);
	}

	public GetInputType() {
		return InputUtil.GetInputTypeFromBinding(this, KeyType.Primary);
	}

	/** Returns the primary key for this binding (if it is a key binding, otherwise returns undefined) */
	public GetKey(): Key | undefined {
		return (this.config as KeyBindingConfig).key ?? Key.None;
	}

	/** Returns the mouse button for this binding (if it is a mouse binding, otherwise returns undefined) */
	public GetMouseButton(): MouseButton | undefined {
		return (this.config as MouseBindingConfig).mouseButton;
	}

	/** Gets the display name for the binding, for example: "Left Shift + S" or "Left Mouse Button" */
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

		const modifierKey = this.GetModifierKey();
		if (modifierKey !== undefined && modifierKey !== Key.None) {
			result = `${InputUtils.GetStringForKeyCode(modifierKey)} + ${result}`
		}
		return result;
	}
}
