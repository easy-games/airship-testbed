import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { CoreUI } from "Shared/UI/CoreUI";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { MainMenuController } from "./MainMenuController";
import { MainMenuPage } from "./MainMenuPageName";

@Controller({})
export class MainMenuNavbarController implements OnStart {
	constructor(private readonly mainMenuController: MainMenuController) {}

	OnStart(): void {
		this.Setup();
	}

	public Setup(): void {
		const refs = this.mainMenuController.refs;

		const homeButton = refs.GetValue("UI", "NavbarHomeButton");
		const avatarShopButton = refs.GetValue("UI", "NavbarAvatarShopButton");
		const myServersButton = refs.GetValue("UI", "NavbarMyServersButton");
		const settingsButton = refs.GetValue("UI", "NavbarSettingsButton");
		const runningGameButton = refs.GetValue("UI", "NavbarRunningGameButton");
		const runningGameCloseButton = refs.GetValue("UI", "NavbarRunningGameCloseButton");

		if (Game.Context !== CoreContext.GAME) {
			runningGameButton.SetActive(false);
		}

		CanvasAPI.OnClickEvent(homeButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPage.HOME);
		});
		CanvasAPI.OnClickEvent(avatarShopButton, () => {
			// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});
		CoreUI.SetupButton(settingsButton);
		CanvasAPI.OnClickEvent(settingsButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});
		CanvasAPI.OnClickEvent(runningGameButton, () => {
			// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});
		CanvasAPI.OnClickEvent(runningGameCloseButton, () => {
			this.Disconnect();
		});

		let currentSelectedNavbarButton: GameObject | undefined = homeButton;
		this.mainMenuController.OnCurrentPageChanged.Connect((page, oldPage) => {
			if (currentSelectedNavbarButton) {
				this.UpdateNavButton(currentSelectedNavbarButton, false);
			}
			if (page === MainMenuPage.HOME) {
				currentSelectedNavbarButton = homeButton;
			} else if (page === MainMenuPage.SETTINGS) {
				currentSelectedNavbarButton = settingsButton;
			}
			if (currentSelectedNavbarButton) {
				this.UpdateNavButton(currentSelectedNavbarButton, true);
			}
		});
	}

	private UpdateNavButton(go: GameObject, selected: boolean): void {
		const text = go.transform.GetChild(0).GetComponent<TMP_Text>();
		if (selected) {
			text.color = new Color(1, 1, 1, 1);
		} else {
			text.color = new Color(0.68, 0.77, 1, 1);
		}
	}

	private Disconnect(): void {
		const clientNetworkConnector = GameObject.Find("Network").GetComponent<ClientNetworkConnector>();
		clientNetworkConnector.Disconnect();
		SceneManager.LoadScene("MainMenu", LoadSceneMode.Single);
	}
}
