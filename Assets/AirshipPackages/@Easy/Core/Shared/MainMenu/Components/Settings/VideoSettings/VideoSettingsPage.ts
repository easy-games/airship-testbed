import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import SettingsButtonGroup from "../Controls/SettingsButtonGroup";
import SettingsToggle from "../Controls/SettingsToggle";

export default class VideoSettingsPage extends AirshipBehaviour {
	public msaaBtnGroup: SettingsButtonGroup;
	public shadowsBtnGroup: SettingsButtonGroup;
	public vsyncToggle: SettingsToggle;
	public shadowsToggle: SettingsToggle;

	override Start(): void {
		this.msaaBtnGroup.Init("Anti Aliasing", Protected.Settings.data.msaaSamples, [
			{
				text: "1x",
				value: 1,
			},
			{
				text: "2x",
				value: 2,
			},
			{
				text: "4x",
				value: 4,
			},
			{
				text: "8x",
				value: 8,
			},
		]);
		this.msaaBtnGroup.onChanged.Connect((val) => {
			Protected.Settings.SetMSAASamples(val as number);
			Protected.Settings.MarkAsDirty();
		});

		// this.shadowsBtnGroup.Init("Shadow Quality", Protected.Settings.data.shadowTier, [
		// 	{ text: "None", value: 0, },
		// 	{ text: "Low", value: 1, },
		// 	{ text: "High", value: 2, }
		// ]);
		// this.shadowsBtnGroup.onChanged.Connect((val) => {
		// 	Protected.Settings.SetShadowLevel(val as number);
		// 	Protected.Settings.MarkAsDirty();
		// });

		if (Game.IsMobile()) {
			this.vsyncToggle.gameObject.SetActive(false);
		} else {
			this.vsyncToggle.Init("VSync", Protected.Settings.data.vsync);
			this.vsyncToggle.toggle.onValueChanged.Connect((val) => {
				Protected.Settings.SetVsync(val);
				Protected.Settings.MarkAsDirty();
			});
		}

		this.shadowsToggle.Init("Shadows", Protected.Settings.data.shadows);
		this.shadowsToggle.toggle.onValueChanged.Connect((val) => {
			Protected.Settings.SetShadowsEnabled(val);
			Protected.Settings.MarkAsDirty();
		});
	}

	override OnDestroy(): void {}
}
