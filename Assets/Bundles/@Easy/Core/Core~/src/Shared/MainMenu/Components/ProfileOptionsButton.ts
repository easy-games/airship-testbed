import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { MainMenuPageType } from "@Easy/Core/Client/MainMenuControllers/MainMenuPageName";
import { ChangeUsernameController } from "@Easy/Core/Client/MainMenuControllers/Social/ChangeUsernameController";
import { RightClickMenuButton } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "../../Airship";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Mouse } from "../../UserInput";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class ProfileOptionsButton extends AirshipBehaviour {
	override Start(): void {
		task.spawn(() => {
			Game.WaitForLocalPlayerLoaded();
			const sprite = Airship.players.CreateProfilePictureSpriteAsync(Game.localPlayer.userId);
			if (sprite) {
				this.gameObject.GetComponent<Image>().sprite = sprite;
			}
		});

		CanvasAPI.OnClickEvent(this.gameObject, () => {
			const options: RightClickMenuButton[] = [];
			if (!Game.IsPortrait()) {
				options.push({
					text: "Settings",
					onClick: () => {
						Dependency<MainMenuController>().RouteToPage(MainMenuPageType.Settings);
					},
				});
			}
			// options.push({
			// 	text: "Change Profile Picture",
			// 	onClick: () => {},
			// });
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
			if (!Game.IsMobile()) {
				options.push({
					text: "Quit",
					onClick: () => {
						Application.Quit();
					},
				});
			}
			Dependency<RightClickMenuController>().OpenRightClickMenu(
				Dependency<MainMenuController>().mainContentCanvas,
				new Mouse().GetLocation(),
				options,
			);
		});
	}

	override OnDestroy(): void {}
}
