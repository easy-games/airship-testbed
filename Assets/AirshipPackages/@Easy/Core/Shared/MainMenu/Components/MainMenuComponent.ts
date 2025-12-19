import { Game } from "../../Game";
import GameGeneralPage from "./Settings/General/GameGeneralPage";
import SocialMenu from "./SocialMenu";

export default class MainMenuComponent extends AirshipBehaviour {
	@Header("Pages")
	public gamePage: GameGeneralPage;
	public gamePageMobile: GameGeneralPage;

	@Header("Social Menu")
	public socialMenu: SocialMenu;

	protected Start(): void {
		// Skybox
		if (!Game.IsInGame()) {
			const skyboxMat = Resources.Load("AvatarEditorSkybox") as Material;
			if (skyboxMat !== undefined) {
				task.spawn(() => {
					Bridge.SetSkyboxMaterial(skyboxMat);
				});
			}
		}
	}
}
