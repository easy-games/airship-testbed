import { Airship } from "@Easy/Core/Shared/Airship";
import { InputAction, InputActionCategory } from "@Easy/Core/Shared/Input/InputAction";
import { ActionInputType, InputUtil, KeyType } from "@Easy/Core/Shared/Input/InputUtil";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import SettingsKeybind from "./SettingsKeybind";

// Define the categories in the order they should be displayed
const INPUT_CATEGORIES: Array<InputActionCategory> = [
	InputActionCategory.Movement,
	InputActionCategory.Inventory,
	InputActionCategory.General,
];
export default class SettingsKeybindPage extends AirshipBehaviour {
	public keybindPrefab!: GameObject;
	public categoryPrefab!: GameObject;
	public resetToDefaultBtn?: GameObject;
	private categoryContents = new Map<InputActionCategory, GameObject>();
	private keybinds = new Set<SettingsKeybind>();

	private bin = new Bin();

	public OnEnable(): void {
		const allBindings = Airship.Input.GetBindings();
		const validBindings: Array<InputAction> = [];

		for (const binding of allBindings) {
			const inputType = InputUtil.GetInputTypeFromBinding(binding.binding, KeyType.Primary);
			if (
				inputType === ActionInputType.Keyboard ||
				inputType === ActionInputType.Mouse ||
				inputType === ActionInputType.Unbound
			) {
				validBindings.push(binding);
			}
		}

		const categoriesWithBindings = new Set<InputActionCategory>();
		for (const binding of validBindings) {
			print(`${binding.name} - ${binding.category}`);
			const category = binding.category ?? InputActionCategory.General;
			categoriesWithBindings.add(category);
		}

		// Only create categories that have bindings, in the defined order
		let categoryIndex = 1;
		for (const category of INPUT_CATEGORIES) {
			if (categoriesWithBindings.has(category)) {
				const go = Object.Instantiate(this.categoryPrefab, this.transform);
				go.transform.SetSiblingIndex(categoryIndex);
				categoryIndex++;
				const categoryText = go.GetComponentInChildren<TMP_Text>()!;
				categoryText.text = category.upper();

				this.categoryContents.set(category, go);
			}
		}

		for (const binding of validBindings) {
			this.AddKeybind(binding);
		}

		if (this.resetToDefaultBtn) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnClickEvent(this.resetToDefaultBtn, () => {
					for (const keybind of this.keybinds) {
						keybind.ResetToDefault();
					}
				}),
			);
		}
	}

	public AddKeybind(action: InputAction): void {
		const category = action.category ?? InputActionCategory.General;
		const categoryContent = this.categoryContents.get(category);

		if (!categoryContent) {
			const generalContent = this.categoryContents.get(InputActionCategory.General);
			if (!generalContent) {
				return;
			}
			const go = Object.Instantiate(this.keybindPrefab, generalContent.transform);
			const keybind = go.GetAirshipComponent<SettingsKeybind>()!;
			this.keybinds.add(keybind);
			keybind.Init(action);
			return;
		}

		const go = Object.Instantiate(this.keybindPrefab, categoryContent.transform);
		const keybind = go.GetAirshipComponent<SettingsKeybind>()!;
		this.keybinds.add(keybind);
		keybind.Init(action);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
