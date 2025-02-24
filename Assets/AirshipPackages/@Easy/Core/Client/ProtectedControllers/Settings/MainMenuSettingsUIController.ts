import { Controller } from "@Easy/Core/Shared/Flamework";
import { Protected } from "@Easy/Core/Shared/Protected";
import { MainMenuController } from "../MainMenuController";

@Controller({})
export class MainMenuSettingsUIController {
	constructor(private readonly mainMenuController: MainMenuController) {}

	protected OnStart(): void {
		Protected.Settings.WaitForSettingsLoaded().then(() => {
			this.Setup();
		});
	}

	public Setup(): void {
		// HD Rendering
		// const toggleHD: Toggle = this.mainMenuController.refs.GetValue("Settings", "HDToggle");
		// toggleHD.isOn = this.clientSettingsController.GetScreenshotRenderHD();
		// this.SetupToggle(toggleHD, (value) => {
		// 	this.clientSettingsController.SetScreenshotRenderHD(value);
		// });
		// Screenshot UI
		// const toggleUI: Toggle = this.mainMenuController.refs.GetValue("Settings", "UIToggle");
		// toggleUI.isOn = this.clientSettingsController.GetScreenshotShowUI();
		// this.SetupToggle(toggleUI, (value) => {
		// 	this.clientSettingsController.SetScreenshotShowUI(value);
		// });
	}
}
