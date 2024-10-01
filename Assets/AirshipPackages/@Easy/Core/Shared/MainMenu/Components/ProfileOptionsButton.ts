import { ProtectedUserController } from "@Easy/Core/Client/ProtectedControllers/Airship/User/UserController";
import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { RightClickMenuButton } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "../../Airship";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Protected } from "../../Protected";
import { CanvasAPI, HoverState } from "../../Util/CanvasAPI";
import { SettingsPageSingleton } from "../Singletons/SettingsPageSingleton";

export default class ProfileOptionsButton extends AirshipBehaviour {
	public hoverBG: Image;
	public profileImage: RawImage;
	public button: Button;

	override Start(): void {
		task.spawn(() => {
			this.UpdatePicture();
		});
		Protected.user.onLocalUserUpdated.Connect(() => {
			task.spawn(() => {
				this.UpdatePicture();
			});
		});

		this.hoverBG.enabled = false;
		CanvasAPI.OnHoverEvent(this.button.gameObject, (hov) => {
			if (hov === HoverState.ENTER) {
				this.hoverBG.enabled = true;
			} else {
				this.hoverBG.enabled = false;
			}
		});

		CanvasAPI.OnClickEvent(this.gameObject, () => {
			const options: RightClickMenuButton[] = [];
			if (!Game.IsMobile()) {
				options.push({
					text: "Settings",
					onClick: () => {
						Dependency<SettingsPageSingleton>().Open();
					},
				});
				if (!Screen.fullScreen) {
					options.push({
						text: "Go Fullscreen",
						onClick: () => {
							Screen.fullScreen = true;
						},
					});
				} else {
					options.push({
						text: "Exit Fullscreen",
						onClick: () => {
							Screen.fullScreen = false;
						},
					});
				}
				options.push({
					text: "Sign out",
					onClick: () => {
						Protected.user.Logout();
					},
				});
				options.push({
					text: "Quit",
					onClick: () => {
						Application.Quit();
					},
				});
			}
			Dependency<RightClickMenuController>().OpenRightClickMenu(
				Dependency<MainMenuController>().mainContentCanvas,
				new Vector2(this.transform.position.x, this.transform.position.y),
				options,
			);
		});
	}

	public UpdatePicture(): void {
		const userController = Dependency<ProtectedUserController>();
		userController.WaitForLocalUser();
		if (userController.localUser) {
			Airship.Players.GetProfilePictureAsync(userController.localUser.uid).then((texture) => {
				if (texture) {
					this.profileImage.texture = texture;
				}
			});
		}
	}

	override OnDestroy(): void {}
}
