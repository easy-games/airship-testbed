import NavbarControlButton from "@Easy/Core/Shared/MainMenu/Components/NavbarControlButton";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { CoreContext } from "Shared/CoreClientContext";
import { Controller, OnStart } from "Shared/Flamework";
import { Game } from "Shared/Game";
import MainMenuNavButton from "Shared/MainMenu/Components/MainMenuNavButton";
import { CoreUI } from "Shared/UI/CoreUI";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { AuthController } from "./Auth/AuthController";
import { MainMenuController } from "./MainMenuController";
import { MainMenuPageType } from "./MainMenuPageName";
import { UserController } from "./User/UserController";

@Controller({})
export class MainMenuNavbarController implements OnStart {
	private refreshButton!: NavbarControlButton;

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly userController: UserController,
		private readonly authController: AuthController,
	) {}

	OnStart(): void {
		this.Setup();

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.R, (event) => {
			if (keyboard.IsEitherKeyDown(KeyCode.LeftCommand, KeyCode.LeftControl)) {
				this.refreshButton.PlayClickEffect();
				this.DoRefresh();
			}
		});
	}

	public DoRefresh(): void {
		if (!this.mainMenuController.currentPage) return;
		print("Refreshing!");

		this.mainMenuController.RouteToPage(this.mainMenuController.currentPage.pageType, true);
	}

	public Setup(): void {
		const refs = this.mainMenuController.refs;

		const homeButton = refs.GetValue("UI", "NavbarHomeButton");
		const avatarButton = refs.GetValue("UI", "NavbarAvatarButton");
		const shopButton = refs.GetValue("UI", "NavbarShopButton");
		const myGamesButton = refs.GetValue("UI", "NavbarMyGamesButton");
		const settingsButton = refs.GetValue("UI", "NavbarSettingsButton");
		const runningGameButton = refs.GetValue("UI", "NavbarRunningGameButton");
		const runningGameCloseButton = refs.GetValue("UI", "NavbarRunningGameCloseButton");

		this.refreshButton = refs.GetValue("UI", "RefreshPageButton").GetAirshipComponent<NavbarControlButton>()!;
		CanvasAPI.OnClickEvent(this.refreshButton.gameObject, () => {
			this.DoRefresh();
		});

		if (Game.context !== CoreContext.GAME) {
			runningGameButton.SetActive(false);
		}

		CoreUI.SetupButton(homeButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(homeButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Home);
		});

		CoreUI.SetupButton(avatarButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(avatarButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Avatar);
		});

		CoreUI.SetupButton(shopButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(shopButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Shop);
		});

		CoreUI.SetupButton(myGamesButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(myGamesButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.MyGames);
		});

		CoreUI.SetupButton(settingsButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(settingsButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.Settings);
		});

		// CoreUI.SetupButton(myServersButton, { noHoverSound: true });
		// CanvasAPI.OnClickEvent(myServersButton, () => {
		// 	// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		// });

		CoreUI.SetupButton(runningGameButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(runningGameButton, () => {
			// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});
		CoreUI.SetupButton(runningGameCloseButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(runningGameCloseButton, () => {
			this.Disconnect();
		});

		let currentSelectedNavbarButton: GameObject | undefined = homeButton;
		this.UpdateNavButton(currentSelectedNavbarButton, true);
		this.mainMenuController.onCurrentPageChanged.Connect((page, oldPage) => {
			if (currentSelectedNavbarButton) {
				this.UpdateNavButton(currentSelectedNavbarButton, false);
			}
			if (page === MainMenuPageType.Home) {
				currentSelectedNavbarButton = homeButton;
			} else if (page === MainMenuPageType.Settings) {
				currentSelectedNavbarButton = settingsButton;
			} else if (page === MainMenuPageType.Avatar) {
				currentSelectedNavbarButton = avatarButton;
			} else if (page === MainMenuPageType.Shop) {
				currentSelectedNavbarButton = shopButton;
			} else if (page === MainMenuPageType.MyGames) {
				currentSelectedNavbarButton = myGamesButton;
			}
			if (currentSelectedNavbarButton) {
				this.UpdateNavButton(currentSelectedNavbarButton, true);
			}
		});

		// const profileButton = this.mainMenuController.refs.GetValue("Navbar", "ProfileButton");
		// CanvasAPI.OnClickEvent(profileButton, () => {
		// 	Dependency<ChangeUsernameController>().Open();
		// 	// const user = this.userController.localUser;
		// 	// if (user) {
		// 	// 	Bridge.CopyToClipboard(user.username + "#" + user.discriminator);
		// 	// }
		// })

		this.UpdateProfileSection();
		this.userController.onLocalUserUpdated.Connect((user) => {
			this.UpdateProfileSection();
		});

		task.spawn(() => {
			const gameData = Game.WaitForGameData();
			// print("child: " + runningGameButton.transform.GetChild(2).gameObject.name);
			const text = runningGameButton.transform.GetChild(2).GetComponent<TMP_Text>();
			text.text = gameData.name;
		});
	}

	public UpdateProfileSection(): void {
		const profileWrapper = this.mainMenuController.refs.GetValue("Navbar", "ProfileButton") as GameObject;
		const usernameText = this.mainMenuController.refs.GetValue("Navbar", "AccountUsername") as TMP_Text;
		const picture = this.mainMenuController.refs.GetValue("Navbar", "AccountPicture") as Image;
		// const disc = this.mainMenuController.refs.GetValue("Navbar", "AccountDiscriminator") as TMP_Text;

		let user = this.userController.localUser;
		if (!user) {
			profileWrapper.SetActive(false);
			return;
		}

		let displayName = user.username;
		if (displayName.size() > 16) {
			displayName = displayName.sub(0, 15);
		}
		usernameText.text = displayName;
		// disc.text = "#" + user.discriminator;
		profileWrapper.SetActive(true);

		const profileLayoutGroup = this.mainMenuController.refs.GetValue("Navbar", "ProfileLayoutGroup");
		LayoutRebuilder.ForceRebuildLayoutImmediate(profileLayoutGroup.GetComponent<RectTransform>());

		const profilerWrapperWrapper = this.mainMenuController.refs.GetValue(
			"Navbar",
			"ProfileWrapperWrapper",
		) as HorizontalLayoutGroup;
		LayoutRebuilder.ForceRebuildLayoutImmediate(profilerWrapperWrapper.GetComponent<RectTransform>());
	}

	private UpdateNavButton(go: GameObject, selected: boolean): void {
		go.GetAirshipComponent<MainMenuNavButton>()?.SetSelected(selected);
		// const img = go.GetComponent<Image>();
		// img.TweenGraphicColor(selected ? new Color(1, 1, 1, 0.27) : ColorUtil.HexToColor("18191A"), 0.12);
		// const text = go.transform.GetChild(0).GetComponent<TMP_Text>();
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
