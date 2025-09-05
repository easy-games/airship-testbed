import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import SettingsButton from "./SettingsButton";

interface SettingsButtonGroupDefinition {
	text: string;
	value: unknown;
}

export default class SettingsButtonGroup extends AirshipBehaviour {
	public text: TMP_Text;
	public settingsButtonPrefab: GameObject;

	public onChanged = new Signal<[value: unknown]>();

	private bin = new Bin();

	@NonSerialized()
	private buttons: SettingsButton[] = [];

	public Init(name: string, startingValue: unknown, options: SettingsButtonGroupDefinition[]) {
		this.gameObject.ClearChildren();
		this.text.text = name;
		for (let option of options) {
			const go = Instantiate(this.settingsButtonPrefab, this.transform);
			const settingsBtn = go.GetAirshipComponent<SettingsButton>()!;
			this.buttons.push(settingsBtn);

			if (startingValue === option.value) {
				settingsBtn.SetSelected(true);
			}

			settingsBtn.Init(option.text, () => {
				settingsBtn.SetSelected(true);
				for (let btn of this.buttons) {
					if (btn === settingsBtn) continue;
					btn.SetSelected(false);
				}
				this.onChanged.Fire(option.value);
			});
		}
	}

	override Start(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
