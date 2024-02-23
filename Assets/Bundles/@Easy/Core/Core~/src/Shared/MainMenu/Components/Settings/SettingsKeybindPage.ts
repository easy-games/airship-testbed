import { Airship } from "@Easy/Core/Shared/Airship";
import { InputAction } from "@Easy/Core/Shared/Input/InputAction";
import { ActionInputType, InputUtil, KeyType } from "@Easy/Core/Shared/Input/InputUtil";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import SettingsKeybind from "./SettingsKeybind";

export default class SettingsKeybindPage extends AirshipBehaviour {
	public keybindPrefab!: GameObject;
	public list!: Transform;
	public resetToDefaultBtn!: GameObject;

	private bin = new Bin();

	public OnEnable(): void {
		this.list.gameObject.ClearChildren();

		const keybinds = Airship.input.GetKeybinds();

		for (const binding of keybinds) {
			const inputType = InputUtil.GetInputTypeFromKeybind(binding.keybind, KeyType.Primary);
			if (
				inputType !== ActionInputType.Keyboard &&
				inputType !== ActionInputType.Mouse &&
				inputType !== ActionInputType.Unbound
			)
				return;
			//const defaultBinding = Airship.input.GetDefaultBindingForAction(binding.name);
			this.AddKeybind(binding);
		}

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.resetToDefaultBtn, () => {
				let childCount = this.list.childCount;
				for (let i = 0; i < childCount; i++) {
					const keybind = this.list.GetChild(i).gameObject.GetAirshipComponent<SettingsKeybind>()!;
					keybind.ResetToDefault();
				}
			}),
		);
	}

	public AddKeybind(action: InputAction): void {
		const go = Object.Instantiate(this.keybindPrefab, this.list);
		const keybind = go.GetAirshipComponent<SettingsKeybind>()!;
		keybind.Init(action);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
