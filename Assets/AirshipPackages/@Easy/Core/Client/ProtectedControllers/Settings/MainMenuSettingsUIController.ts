import { ClientSettingsController } from "@Easy/Core/Client/ProtectedControllers//Settings/ClientSettingsController";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { MainMenuController } from "../MainMenuController";

@Controller({})
export class MainMenuSettingsUIController implements OnStart {
	constructor(
		private readonly clientSettingsController: ClientSettingsController,
		private readonly mainMenuController: MainMenuController,
	) {}

	OnStart(): void {
		this.clientSettingsController.WaitForSettingsLoaded().then(() => {
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
