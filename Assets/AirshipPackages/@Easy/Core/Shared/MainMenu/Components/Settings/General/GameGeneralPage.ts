import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { SettingsPageSingleton } from "../../../Singletons/SettingsPageSingleton";
import MainMenuPageComponent from "../../MainMenuPageComponent";
import { SettingsTab } from "../SettingsPageName";

export default class GameGeneralPage extends MainMenuPageComponent {
	public buttonsWrapper: RectTransform;
	public settingsBtn: Button;
	public keybindsBtn: Button;

	private bin = new Bin();

	public OnEnable(): void {
		this.buttonsWrapper.gameObject.SetActive(!Game.IsMobile());
		if (!Game.IsMobile()) {
			this.bin.Add(
				this.settingsBtn.onClick.Connect(() => {
					Dependency<SettingsPageSingleton>().Open(SettingsTab.Input);
				}),
			);
			this.bin.Add(
				this.keybindsBtn.onClick.Connect(() => {
					Dependency<SettingsPageSingleton>().Open(SettingsTab.Keybinds);
				}),
			);
		}
	}

	override GetTargetAnchoredPositionY(): number {
		if (Game.deviceType === AirshipDeviceType.Phone) {
			return -10;
		} else {
			return -95;
		}
	}

	override Start(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
