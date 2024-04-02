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
}
