import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { MainMenuSingleton } from "../Singletons/MainMenuSingleton";
import PartyCard from "./Party/PartyCard";
import GameGeneralPage from "./Settings/General/GameGeneralPage";
import SocialMenu from "./SocialMenu";

export default class MainMenuComponent extends AirshipBehaviour {
	@Header("Pages")
	public gamePage: GameGeneralPage;
	public gamePageMobile: GameGeneralPage;

	@Header("Social Menu")
	public socialMenu: SocialMenu;

	@Header("Other")
	public partyCard: PartyCard;

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

		const mainMenu = Dependency<MainMenuSingleton>();
		mainMenu.partyCardModifier.Observe((values) => {
			let shouldBeHidden = values.some((v) => v.hidden);
			this.partyCard.gameObject.SetActive(!shouldBeHidden);
		});
	}
}
