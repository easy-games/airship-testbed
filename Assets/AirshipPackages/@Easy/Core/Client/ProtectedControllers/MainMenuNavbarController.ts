import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import MainMenuNavButton from "@Easy/Core/Shared/MainMenu/Components/MainMenuNavButton";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ProtectedUserController } from "./Airship/User/UserController";
import { AuthController } from "./Auth/AuthController";
import { MainMenuController } from "./MainMenuController";
import { MainMenuPageType } from "./MainMenuPageName";

@Controller({})
export class MainMenuNavbarController {
	private searchFocused!: GameObject;

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly userController: ProtectedUserController,
		private readonly authController: AuthController,
	) {}

	protected OnStart(): void {
		this.Setup();

		Keyboard.OnKeyDown(Key.R, (event) => {
			if (Keyboard.IsEitherKeyDown(Key.LeftCommand, Key.LeftCtrl)) {
				this.DoRefresh();
			}
		});
	}

	public DoRefresh(): void {
		if (!this.mainMenuController.currentPage) return;

		this.mainMenuController.RouteToPage(this.mainMenuController.currentPage.pageType, true);
	}

	public Setup(): void {
		const refs = this.mainMenuController.refs;

		const logoButton = refs.GetValue("UI", "LogoButton");
		const homeButton = refs.GetValue("UI", "NavbarHomeButton");
		const avatarButton = refs.GetValue("UI", "NavbarAvatarButton");
		const myGamesButton = refs.GetValue("UI", "NavbarMyGamesButton");
		const runningGameButton = refs.GetValue("UI", "NavbarRunningGameButton");
		const disconnectButton = refs.GetValue("UI", "DisconnectButton");

		if (Game.coreContext === CoreContext.GAME) {
			// settingsButton.SetActive(false);
			// disconnectButton.SetActive(true);
			runningGameButton.SetActive(true);
		} else {
			runningGameButton.SetActive(false);
			// disconnectButton.SetActive(false);
		}

		CoreUI.SetupButton(homeButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(homeButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Home);
		});
		CanvasAPI.OnClickEvent(logoButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Home);
		});

		CoreUI.SetupButton(avatarButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(avatarButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Avatar);
		});

		// CoreUI.SetupButton(shopButton, { noHoverSound: true });
		// CanvasAPI.OnClickEvent(shopButton, () => {
		// 	this.mainMenuController.RouteToPage(MainMenuPageType.Shop);
		// });

		CoreUI.SetupButton(myGamesButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(myGamesButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Develop);
		});

		// CoreUI.SetupButton(myServersButton, { noHoverSound: true });
		// CanvasAPI.OnClickEvent(myServersButton, () => {
		// 	// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		// });

		CoreUI.SetupButton(runningGameButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(runningGameButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Game);
		});

		let currentSelectedNavbarButton: GameObject | undefined = homeButton;
		if (Game.coreContext === CoreContext.GAME) {
			currentSelectedNavbarButton = runningGameButton;
		}
		this.UpdateNavButton(currentSelectedNavbarButton, true);
		this.mainMenuController.onPageChange.Connect((event) => {
			if (currentSelectedNavbarButton) {
				this.UpdateNavButton(currentSelectedNavbarButton, false);
			}
			const page = event.newPage;
			if (page === MainMenuPageType.Home) {
				currentSelectedNavbarButton = homeButton;
			} else if (page === MainMenuPageType.Game) {
				currentSelectedNavbarButton = runningGameButton;
			} else if (page === MainMenuPageType.Avatar || page === MainMenuPageType.AvatarMobile) {
				currentSelectedNavbarButton = avatarButton;
			} else if (page === MainMenuPageType.Develop) {
				currentSelectedNavbarButton = myGamesButton;
			}
			if (currentSelectedNavbarButton) {
				this.UpdateNavButton(currentSelectedNavbarButton, true);
			}
		});

		task.spawn(() => {
			const gameData = Game.WaitForGameData();
			const text = runningGameButton.transform.Find("GameName")!.GetComponent<TMP_Text>()!;
			//text.text = ""; // have to do this or else setting to the default value "bedwars" will break.
			//text.text = gameData.name;
			Bridge.UpdateLayout(runningGameButton.transform, false);
		});

		const searchbarButton = refs.GetValue("UI", "Searchbar");
		this.searchFocused = refs.GetValue("UI", "SearchFocused");
		CanvasAPI.OnClickEvent(searchbarButton, () => {
			this.FocusSearchbar();
		});

		Keyboard.OnKeyDown(Key.K, () => {
			if (Keyboard.IsEitherKeyDown(Key.LeftCommand, Key.LeftCtrl)) {
				this.FocusSearchbar();
			}
		});
	}

	public FocusSearchbar(): void {
		if (!this.mainMenuController.IsOpen()) {
			this.mainMenuController.OpenFromGameInProtectedContext();
		}
		AppManager.OpenCustom(
			() => {
				this.searchFocused.SetActive(false);
			},
			{
				addToStack: true,
				darkBackground: false,
			},
		);
		this.searchFocused.SetActive(true);
	}

	private UpdateNavButton(go: GameObject, selected: boolean): void {
		go.GetAirshipComponent<MainMenuNavButton>()?.SetSelected(selected);
		// const img = go.GetComponent<Image>()!;
		// img.TweenGraphicColor(selected ? new Color(1, 1, 1, 0.27) : ColorUtil.HexToColor("18191A"), 0.12);
		// const text = go.transform.GetChild(0).GetComponent<TMP_Text>()!;
		// if (selected) {
		// 	text.color = new Color(1, 1, 1, 1);
		// 	// go.transform.GetChild(0).gameObject.SetActive(true);
		// } else {
		// 	text.color = ColorUtil.HexToColor("AEC5FF");
		// 	// go.transform.GetChild(0).gameObject.SetActive(false);
		// }
	}

	private Disconnect(): void {
		TransferManager.Instance.Disconnect();
	}
}
