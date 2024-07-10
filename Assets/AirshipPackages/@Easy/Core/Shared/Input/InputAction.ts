import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Airship } from "../Airship";
import { Binding } from "./Binding";
import { ModifierKey } from "./InputUtil";

export interface SerializableAction {
  /**
   *
   */
  name: string;
  /**
   *
   */
  primaryKey: Key;
  /**
   *
   */
  modifierKey: ModifierKey;
  /**
   *
   */
  mouseButton: MouseButton;
  /**
   *
   */
  category: string;
}

export interface InputActionSchema {
  /**
   *
   */
  name: string;
  /**
   *
   */
  binding: Binding;
  /**
   *
   */
  secondaryBinding?: Binding;
  /**
   *
   */
  category?: string;
}

export class InputActionConfig {
  /**
   *
   */
  secondaryBinding?: Binding;
  /**
   *
   */
  category?: string;
}

export class InputAction {
  /**
   *
   */
  public static inputActionId = 0;
  /**
   *
   */
  public id: number;
  /**
   *
   */
  public name: string;
  /**
   *
   */
  public defaultBinding: Binding;
  /**
   *
   */
  public binding: Binding;
  /**
   *
   */
  public category: string;
  /**
   *
   */
  public isSecondary: boolean;

  constructor(
    name: string,
    binding: Binding,
    isSecondary: boolean,
    category = "General"
  ) {
    this.id = InputAction.inputActionId++;
    this.name = name;
    this.defaultBinding = ObjectUtils.deepCopy(binding);
    this.isSecondary = isSecondary;
    this.binding = binding;
    this.category = category;
  }

  /**
   *
   * @param newKeybind
   */
  public UpdateBinding(newBinding: Binding): void {
    this.binding.Update(newBinding);
    Airship.Input.onActionBound.Fire(this);
  }

  /**
   *
   */
  public UnsetBinding(): void {
    this.binding.Unset();
    Airship.Input.onActionUnbound.Fire(this);
  }

  /**
   *
   */
  public ResetBinding(): void {
    this.binding.Update(this.defaultBinding);
    Airship.Input.onActionBound.Fire(this);
  }

  /**
   *
   * @returns
   */
  public IsDesktopPeripheral(): boolean {
    return this.binding.IsDesktopPeripheral();
  }

  /**
   *
   * @returns
   */
  public IsComplexBinding(): boolean {
    return this.binding.IsComplexBinding();
  }

  /**
   *
   * @param otherAction
   * @returns
   */
  public DoBindingsMatch(otherAction: InputAction): boolean {
    return Binding.AreEqual(this.binding, otherAction.binding);
  }

  /**
   *
   * @returns
   */
  public Serialize(): SerializableAction {
    return {
      name: this.name,
      primaryKey: this.binding.config.isKeyBinding
        ? this.binding.config.key
        : Key.None,
      modifierKey: this.binding.config.modifierKey,
      mouseButton: !this.binding.config.isKeyBinding
        ? this.binding.config.mouseButton
        : (-1 as MouseButton),
      category: this.category,
    };
  }
}
