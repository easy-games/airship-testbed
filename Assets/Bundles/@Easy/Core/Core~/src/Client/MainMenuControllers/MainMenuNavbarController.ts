import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { CoreUI } from "Shared/UI/CoreUI";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { AuthController } from "./Auth/AuthController";
import { MainMenuController } from "./MainMenuController";
import { MainMenuPageType } from "./MainMenuPageName";
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
		const avatarButton = refs.GetValue("UI", "NavbarAvatarButton");
		const shopButton = refs.GetValue("UI", "NavbarShopButton");
		// const myServersButton = refs.GetValue("UI", "NavbarMyServersButton");
		const settingsButton = refs.GetValue("UI", "NavbarSettingsButton");
		const runningGameButton = refs.GetValue("UI", "NavbarRunningGameButton");
		const runningGameCloseButton = refs.GetValue("UI", "NavbarRunningGameCloseButton");

		if (Game.context !== CoreContext.GAME) {
			runningGameButton.SetActive(false);
		}

		CoreUI.SetupButton(homeButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(homeButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.HOME);
		});

		CoreUI.SetupButton(avatarButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(avatarButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.AVATAR);
		});

		CoreUI.SetupButton(shopButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(shopButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.SHOP);
		});

		CoreUI.SetupButton(settingsButton, { noHoverSound: true });
		CanvasAPI.OnClickEvent(settingsButton, () => {
			this.mainMenuController.RouteToPage(MainMenuPageType.SETTINGS);
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
		this.mainMenuController.onCurrentPageChanged.Connect((page, oldPage) => {
			if (currentSelectedNavbarButton) {
				this.UpdateNavButton(currentSelectedNavbarButton, false);
			}
			if (page === MainMenuPageType.HOME) {
				currentSelectedNavbarButton = homeButton;
			} else if (page === MainMenuPageType.SETTINGS) {
				currentSelectedNavbarButton = settingsButton;
			} else if (page === MainMenuPageType.AVATAR) {
				currentSelectedNavbarButton = avatarButton;
			} else if (page === MainMenuPageType.SHOP) {
				currentSelectedNavbarButton = shopButton;
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
			// go.transform.GetChild(0).gameObject.SetActive(true);
		} else {
			text.color = ColorUtil.HexToColor("AEC5FF");
			// go.transform.GetChild(0).gameObject.SetActive(false);
		}
	}

	private Disconnect(): void {
		TransferManager.Instance.Disconnect();
	}
}
