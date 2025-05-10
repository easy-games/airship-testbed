import { Protected } from "@Easy/Core/Shared/Protected";
import SettingsToggle from "../Controls/SettingsToggle";

export default class VideoSettingsPage extends AirshipBehaviour {
	public msaaToggle: SettingsToggle;
	public hdShadowsToggle: SettingsToggle;
	public vsyncToggle: SettingsToggle;

	override Start(): void {
		this.msaaToggle.Init("Anti Aliasing", Protected.Settings.data.antiAliasing === 1);
		this.msaaToggle.toggle.onValueChanged.Connect((val) => {
			Protected.Settings.SetAntiAliasing(val ? 1 : 0);
			Protected.Settings.MarkAsDirty();
		});

		this.hdShadowsToggle.Init("HD Shadows", Protected.Settings.data.shadowLevel === 1);
		this.hdShadowsToggle.toggle.onValueChanged.Connect((val) => {
			Protected.Settings.SetShadowLevel(val ? 1 : 0);
			Protected.Settings.MarkAsDirty();
		});

		this.vsyncToggle.Init("VSync", Protected.Settings.data.vsync);
		this.vsyncToggle.toggle.onValueChanged.Connect((val) => {
			Protected.Settings.SetVsync(val);
			Protected.Settings.MarkAsDirty();
		});
	}

	override OnDestroy(): void {}
}
