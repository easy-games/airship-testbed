import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { ChangeUsernameController } from "@Easy/Core/Client/MainMenuControllers/Social/ChangeUsernameController";
import { RightClickMenuButton } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Dependency } from "../../Flamework";
import { Mouse } from "../../UserInput";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class ProfileOptionsButton extends AirshipBehaviour {
	override Start(): void {
		CanvasAPI.OnClickEvent(this.gameObject, () => {
			const options: RightClickMenuButton[] = [];
			options.push({
				text: "Change Profile Picture",
				onClick: () => {},
			});
			options.push({
				text: "Change Username",
				onClick: () => {
					Dependency<ChangeUsernameController>().Open();
				},
			});
			options.push({
				text: "Logout",
				onClick: () => {
					AuthManager.ClearSavedAccount();
					Bridge.LoadScene("Login", true);
				},
			});
			options.push({
				text: "Quit",
				onClick: () => {
					Application.Quit();
				},
			});
			Dependency<RightClickMenuController>().OpenRightClickMenu(
				Dependency<MainMenuController>().mainContentCanvas,
				new Mouse().GetLocation(),
				options,
			);
		});
	}

	override OnDestroy(): void {}
}
