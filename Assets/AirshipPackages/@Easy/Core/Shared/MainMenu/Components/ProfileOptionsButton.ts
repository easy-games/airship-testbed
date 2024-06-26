import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { RightClickMenuButton } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuController";
import { UserController } from "@Easy/Core/Client/ProtectedControllers/User/UserController";
import { Airship } from "../../Airship";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Protected } from "../../Protected";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class ProfileOptionsButton extends AirshipBehaviour {
	override Start(): void {
		task.spawn(() => {
			this.UpdatePicture();
		});
		Protected.user.onLocalUserUpdated.Connect(() => {
			task.spawn(() => {
				this.UpdatePicture();
			});
		});

		CanvasAPI.OnClickEvent(this.gameObject, () => {
			const options: RightClickMenuButton[] = [];
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
				new Vector2(this.transform.position.x, this.transform.position.y),
				options,
			);
		});
	}

	public UpdatePicture(): void {
		const userController = Dependency<UserController>();
		userController.WaitForLocalUserReady();
		if (userController.localUser) {
			Airship.Players
				.GetProfilePictureTextureFromImageIdAsync(
					userController.localUser.uid,
					userController.localUser.profileImageId,
				)
				.then((texture) => {
					if (texture) {
						this.gameObject.GetComponent<RawImage>()!.texture = texture;
					}
				});
		}
	}

	override OnDestroy(): void {}
}
