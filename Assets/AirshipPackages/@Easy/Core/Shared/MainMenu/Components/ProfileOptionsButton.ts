import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { RightClickMenuButton } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "../../Airship";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class ProfileOptionsButton extends AirshipBehaviour {
	override Start(): void {
		task.spawn(async () => {
			Game.WaitForLocalPlayerLoaded();
			const sprite = await Airship.players.GetProfilePictureSpriteAsync(Game.localPlayer.userId);
			if (sprite) {
				this.gameObject.GetComponent<Image>()!.sprite = sprite;
			}
		});

		CanvasAPI.OnClickEvent(this.gameObject, () => {
			const options: RightClickMenuButton[] = [];
			options.push({
				text: "Logout",
				onClick: () => {
					AuthManager.ClearSavedAccount();
					Bridge.LoadScene("Login", true, LoadSceneMode.Single);
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
				new Vector2(this.transform.position.x, this.transform.position.y),
				options,
			);
		});
	}

	override OnDestroy(): void {}
}
