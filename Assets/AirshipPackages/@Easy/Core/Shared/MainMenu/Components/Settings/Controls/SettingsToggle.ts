import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import AirshipToggle from "../../AirshipToggle";

export default class SettingsToggle extends AirshipBehaviour {
	public titleText: TMP_Text;
	public toggle: AirshipToggle;

	private bin = new Bin();

	public Init(title: string, startingValue: boolean): void {
		this.titleText.text = title;
		this.toggle.SetValue(startingValue, true);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.toggle.gameObject, () => {
				if (Game.IsMobile()) VibrationManager.Play(VibrationFeedbackType.Medium);
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
