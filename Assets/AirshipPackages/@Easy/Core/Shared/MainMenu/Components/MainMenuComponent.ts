import GameGeneralPage from "./Settings/General/GameGeneralPage";
import SocialMenu from "./SocialMenu";

export default class MainMenuComponent extends AirshipBehaviour {
	@Header("Pages")
	public gamePage: GameGeneralPage;
	public gamePageMobile: GameGeneralPage;

	@Header("Social Menu")
	public socialMenu: SocialMenu;
}
