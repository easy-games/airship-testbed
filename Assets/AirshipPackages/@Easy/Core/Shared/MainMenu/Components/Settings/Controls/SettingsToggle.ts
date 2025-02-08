import AirshipToggle from "../../AirshipToggle";

export default class SettingsToggle extends AirshipBehaviour {
	public titleText: TMP_Text;
	public toggle: AirshipToggle;

	public Init(title: string, startingValue: boolean): void {
		this.titleText.text = title;
		this.toggle.SetValue(startingValue);
	}
}
