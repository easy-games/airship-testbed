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
		this.AddKeybind("reload", KeyCode.T, KeyCode.R);
		this.AddKeybind("jump", KeyCode.Space, KeyCode.Space);
		this.AddKeybind("forward", KeyCode.W, KeyCode.W);

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

	public AddKeybind(name: string, currentKeyCode: KeyCode | undefined, defaultKeyCode: KeyCode): void {
		const go = Object.Instantiate(this.keybindPrefab, this.list);
		const keybind = go.GetAirshipComponent<SettingsKeybind>()!;
		keybind.Init(name, currentKeyCode, defaultKeyCode);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
