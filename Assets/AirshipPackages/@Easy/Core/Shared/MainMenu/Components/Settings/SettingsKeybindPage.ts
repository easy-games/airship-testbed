import { Airship } from "@Easy/Core/Shared/Airship";
import { InputAction, InputKeybindCategory } from "@Easy/Core/Shared/Input/InputAction";
import { ActionInputType, InputUtil, KeyType } from "@Easy/Core/Shared/Input/InputUtil";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import SettingsKeybind from "./SettingsKeybind";

export default class SettingsKeybindPage extends AirshipBehaviour {
	public keybindPrefab!: GameObject;
	public categoryPrefab!: GameObject;
	public resetToDefaultBtn?: GameObject;
	private categoryContents = new Map<string, GameObject>();
	private keybinds = new Set<SettingsKeybind>();
	private addedBindingIds = new Set<number>();

	private bin = new Bin();

	public OnEnable(): void {
		const allBindings = Airship.Input.GetBindings();
		const validBindings: Array<InputAction> = [];

		for (const binding of allBindings) {
			if (binding.hidden) {
				continue;
			}
			const inputType = InputUtil.GetInputTypeFromBinding(binding.binding, KeyType.Primary);
			if (
				inputType === ActionInputType.Keyboard ||
				inputType === ActionInputType.Mouse ||
				inputType === ActionInputType.Unbound
			) {
				validBindings.push(binding);
			}
		}

		const categoriesWithBindings = new Set<string>();
		for (const binding of validBindings) {
			const category = binding.category ?? InputKeybindCategory.Misc;
			categoriesWithBindings.add(category);
		}

		// Create category game Objects in the registered order if they have bindings
		// and they don't already have a game Object
		const allRegisteredCategories = Airship.Input.GetRegisteredKeybindCategories();
		let categoryIndex = 0;
		for (const category of allRegisteredCategories) {
			if (categoriesWithBindings.has(category) && !this.categoryContents.has(category)) {
				const go = Object.Instantiate(this.categoryPrefab, this.transform);
				go.transform.SetSiblingIndex(categoryIndex);
				categoryIndex++;
				const categoryText = go.GetComponentInChildren<TMP_Text>()!;
				categoryText.text = category;
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
		// Prevent duplicate keybinds from being added
		if (this.addedBindingIds.has(action.id)) {
			return;
		}
		this.addedBindingIds.add(action.id);

		const category = action.category ?? InputKeybindCategory.Misc;
		const categoryContent = this.categoryContents.get(category);

		if (!categoryContent) {
			const availableCategories: string[] = [];
			for (const [cat] of this.categoryContents) {
				availableCategories.push(cat);
			}
			const miscContent = this.categoryContents.get(InputKeybindCategory.Misc);
			if (!miscContent) {
				return;
			}
			const go = Object.Instantiate(this.keybindPrefab, miscContent.transform);
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
