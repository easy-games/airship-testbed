import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { MainMenuPageType } from "@Easy/Core/Client/ProtectedControllers/MainMenuPageName";
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
	public partyCard: PartyCard; // Shown in landscape mode
	public mobilePartyCard: PartyCard; // Part of mobile navbar

	protected Awake(): void {
		if (!MainMenuComponent.ShouldUseMobilePartyCard()) {
			this.mobilePartyCard.gameObject.SetActive(false);
		}
	}

	public static ShouldUseMobilePartyCard(): boolean {
		return Game.IsMobile() && !Game.IsInGame();
	}

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

		if (MainMenuComponent.ShouldUseMobilePartyCard()) {
			this.partyCard.gameObject.SetActive(false);

			const partyController = Dependency<ProtectedPartyController>();
			const CheckPartyCardVisibility = () => {
				const party = partyController.currentParty;
				if (Dependency<MainMenuController>().currentPage?.pageType === MainMenuPageType.Friends) {
					this.mobilePartyCard.gameObject.SetActive(true);
					return;
				}
				if (party === undefined || party.members.size() <= 1) {
					this.mobilePartyCard.gameObject.SetActive(false);
					return;
				}
				this.mobilePartyCard.gameObject.SetActive(true);
			};
			partyController.onPartyChange.Connect(() => {
				CheckPartyCardVisibility();
			});
			Dependency<MainMenuController>().onPageChange.Connect(() => {
				CheckPartyCardVisibility();
			});
			CheckPartyCardVisibility();
		}
	}
}
