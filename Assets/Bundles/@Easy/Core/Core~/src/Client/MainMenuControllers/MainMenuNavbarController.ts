import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { CoreUI } from "Shared/UI/CoreUI";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { AuthController } from "./Auth/AuthController";
import { MainMenuController } from "./MainMenuController";
import { MainMenuPage } from "./MainMenuPageName";
import { UserController } from "./User/UserController";

@Controller({})
export class MainMenuNavbarController implements OnStart {
	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly userController: UserController,
		private readonly authController: AuthController,
	) {}

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

		CoreUI.SetupButton(homeButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(homeButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPage.HOME);
		});

		CoreUI.SetupButton(avatarShopButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(avatarShopButton, () => {
			// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});

		CoreUI.SetupButton(settingsButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(settingsButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});

		CoreUI.SetupButton(myServersButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(myServersButton, () => {
			// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});

		CoreUI.SetupButton(runningGameButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(runningGameButton, () => {
			// this.mainMenuController.RouteToPage(MainMenuPage.SETTINGS);
		});
		CoreUI.SetupButton(runningGameCloseButton, { noHoverSound: true });
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

		const profileButton = this.mainMenuController.refs.GetValue("Navbar", "ProfileButton");
		CanvasAPI.OnClickEvent(profileButton, () => {
			const user = this.userController.localUser;
			if (user) {
				Bridge.CopyToClipboard(user.username + "#" + user.discriminator);
			}
		});

		this.UpdateProfileSection();
		this.userController.onLocalUserUpdated.Connect((user) => {
			this.UpdateProfileSection();
		});
	}

	public UpdateProfileSection(): void {
		const profileWrapper = this.mainMenuController.refs.GetValue("Navbar", "ProfileButton") as GameObject;
		const usernameText = this.mainMenuController.refs.GetValue("Navbar", "AccountUsername") as TMP_Text;
		const picture = this.mainMenuController.refs.GetValue("Navbar", "AccountPicture") as Image;
		const disc = this.mainMenuController.refs.GetValue("Navbar", "AccountDiscriminator") as TMP_Text;

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
		disc.text = "#" + user.discriminator;
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
		const text = go.transform.GetChild(0).GetComponent<TMP_Text>();
		if (selected) {
			text.color = new Color(1, 1, 1, 1);
		} else {
			text.color = new Color(0.68, 0.77, 1, 1);
		}
	}

	private Disconnect(): void {
		TransferManager.Instance.Disconnect();
	}
}
