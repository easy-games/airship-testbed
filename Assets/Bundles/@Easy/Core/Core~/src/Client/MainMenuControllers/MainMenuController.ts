import { Controller, Dependency, OnStart } from "Shared/Flamework";
import HomePageComponent from "Client/Components/HomePage/HomePageComponent";
import { CoreContext } from "Shared/CoreClientContext";
import { CoreRefs } from "Shared/CoreRefs";
import { Game } from "Shared/Game";
import { Keyboard, Mouse } from "Shared/UserInput";
import { AppManager } from "Shared/Util/AppManager";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { SetTimeout } from "Shared/Util/Timer";
import AvatarViewComponent from "../../Shared/Avatar/AvatarViewComponent";
import AvatarMenuComponent from "./AvatarMenu/AvatarMenuComponent";
import MainMenuPageComponent from "./MainMenuPageComponent";
import { MainMenuPageType } from "./MainMenuPageName";
import { ChangeUsernameController } from "./Social/ChangeUsernameController";
import { RightClickMenuButton } from "./UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "./UI/RightClickMenu/RightClickMenuController";

@Controller()
export class MainMenuController implements OnStart {
	private readonly socialTweenDuration = 0.25;

	public mainMenuGo: GameObject;
	public refs: GameObjectReferences;
	public currentPage?: MainMenuPageComponent;
	public avatarView?: AvatarViewComponent;
	public onCurrentPageChanged = new Signal<[page: MainMenuPageType, oldPage: MainMenuPageType | undefined]>();
	private pageMap: Map<MainMenuPageType, MainMenuPageComponent>;
	private wrapperRect: RectTransform;

	public mainContentCanvas: Canvas;
	public mainContentGroup: CanvasGroup;
	public socialMenuGroup: CanvasGroup;
	private rootCanvasGroup: CanvasGroup;

	private toggleSocialButton: Button;

	private open = false;
	private socialIsVisible = true;

	constructor() {
		const mainMenuPrefab = AssetBridge.Instance.LoadAsset("@Easy/Core/Client/Resources/MainMenu/MainMenu.prefab");
		this.mainMenuGo = Object.Instantiate(mainMenuPrefab, CoreRefs.rootTransform) as GameObject;
		this.refs = this.mainMenuGo.GetComponent<GameObjectReferences>();
		const wrapperGo = this.refs.GetValue("UI", "Wrapper");
		this.wrapperRect = wrapperGo.GetComponent<RectTransform>();
		this.rootCanvasGroup = this.mainMenuGo.GetComponent<CanvasGroup>();
		this.mainContentCanvas = this.refs.GetValue<Canvas>("UI", "MainContentCanvas");
		this.mainContentGroup = this.refs.GetValue<CanvasGroup>("UI", "MainContentGroup");
		this.socialMenuGroup = this.refs.GetValue<CanvasGroup>("UI", "SocialGroup");

		const mouse = new Mouse();

		this.pageMap = new Map<MainMenuPageType, MainMenuPageComponent>([
			[MainMenuPageType.Home, this.refs.GetValue("Pages", "Home").GetComponent<HomePageComponent>()],
			[MainMenuPageType.MyGames, this.refs.GetValue("Pages", "MyGames").GetComponent<MainMenuPageComponent>()],
			[MainMenuPageType.Settings, this.refs.GetValue("Pages", "Settings").GetComponent<MainMenuPageComponent>()],
			[MainMenuPageType.Avatar, this.refs.GetValue("Pages", "Avatar").GetComponent<AvatarMenuComponent>()],
		]);

		this.avatarView = Object.Instantiate(
			this.refs.GetValue<GameObject>("Avatar", "Avatar3DSceneTemplate"),
			CoreRefs.rootTransform,
		).GetComponent<AvatarViewComponent>();
		if (Game.context === CoreContext.GAME) {
			this.avatarView.HideAvatar();
		}

		const gameBG = this.refs.GetValue("UI", "GameBG");
		const mainMenuBG = this.refs.GetValue("UI", "MainMenuBG");
		const isMainMenu = Game.context === CoreContext.MAIN_MENU;
		gameBG.SetActive(!isMainMenu);
		mainMenuBG.SetActive(isMainMenu);

		const closeButton = this.refs.GetValue("UI", "CloseButton");
		if (Game.context === CoreContext.MAIN_MENU) {
			const mouse = new Mouse();
			mouse.AddUnlocker();

			closeButton.SetActive(false);
		} else {
			CanvasAPI.OnClickEvent(closeButton, () => {
				AppManager.Close();
			});
		}

		this.toggleSocialButton = this.refs.GetValue("UI", "ToggleSocialButton");
		CanvasAPI.OnClickEvent(this.toggleSocialButton.gameObject, () => {
			this.ToggleSocialView();
		});

		const profileGO = this.refs.GetValue("Social", "Profile");
		CanvasAPI.OnClickEvent(profileGO, () => {
			const options: RightClickMenuButton[] = [];
			options.push({
				text: "Change Profile Picture",
				onClick: () => {},
			});
			options.push({
				text: "Change Username",
				onClick: () => {
					Dependency<ChangeUsernameController>().Open();
				},
			});
			options.push({
				text: "Logout",
				onClick: () => {
					AuthManager.ClearSavedAccount();
					Bridge.LoadScene("Login", true);
				},
			});
			Dependency<RightClickMenuController>().OpenRightClickMenu(
				this.mainContentCanvas,
				mouse.GetLocation(),
				options,
			);
		});

		if (Game.context === CoreContext.GAME) {
			this.mainContentCanvas.enabled = false;
		}
	}

	public OpenFromGame(): void {
		if (this.open) return;
		this.avatarView?.ShowAvatar();

		AppManager.OpenCustom(() => {
			this.CloseFromGame();
		});
		this.open = true;
		const duration = 0.06;
		this.wrapperRect.localScale = new Vector3(1.1, 1.1, 1.1);
		this.wrapperRect.TweenLocalScale(new Vector3(1, 1, 1), duration);
		this.mainContentCanvas.enabled = true;
		this.rootCanvasGroup.TweenCanvasGroupAlpha(1, duration);
	}

	public CloseFromGame(): void {
		if (!this.open) return;
		this.open = false;
		this.avatarView?.HideAvatar();
		EventSystem.current.ClearSelected();

		const duration = 0.06;
		this.wrapperRect.TweenLocalScale(new Vector3(1.1, 1.1, 1.1), duration);
		this.rootCanvasGroup.TweenCanvasGroupAlpha(0, duration);
		SetTimeout(duration, () => {
			if (!this.open) {
				this.mainContentCanvas.enabled = false;
			}
		});
	}

	public IsOpen(): boolean {
		return this.open;
	}

	OnStart(): void {
		if (this.currentPage === undefined) {
			//init pages
			for (const [key, value] of this.pageMap) {
				if (value) {
					value.Init(this, key);
				}
			}

			this.RouteToPage(MainMenuPageType.Home, true, true);
		}

		if (Game.context === CoreContext.GAME) {
			const keyboard = new Keyboard();
			keyboard.OnKeyDown(
				KeyCode.Escape,
				(event) => {
					this.OpenFromGame();
				},
				SignalPriority.LOW,
			);

			// const leaveButton = this.refs.GetValue("UI", "LeaveButton");
			// CoreUI.SetupButton(leaveButton);
			// CanvasAPI.OnClickEvent(leaveButton, () => {
			// 	this.Disconnect();
			// });
		}
	}

	public RouteToPage(pageType: MainMenuPageType, force = false, noTween = false) {
		if (this.currentPage?.pageType === pageType && !force) {
			return;
		}

		const oldPage = this.currentPage;
		this.currentPage = this.pageMap.get(pageType);

		// Remove old page
		if (oldPage) {
			oldPage.ClosePage();
		}

		this.currentPage?.OpenPage();

		this.onCurrentPageChanged.Fire(pageType, oldPage?.pageType);
	}

	private ToggleSocialView() {
		this.socialIsVisible = !this.socialIsVisible;
		this.toggleSocialButton.image.transform.localEulerAngles = new Vector3(0, 0, this.socialIsVisible ? 0 : 180);
		this.socialMenuGroup.transform.TweenAnchoredPositionX(this.socialIsVisible ? 0 : 400, this.socialTweenDuration);

		let mainRect = this.mainContentGroup.GetComponent<RectTransform>();
		// mainRect.TweenAnchorMax(
		// 	new Vector2(this.socialIsVisible ? Screen.width : Screen.width - 400, mainRect.anchorMax.y),
		// 	this.socialTweenDuration,
		// );
		mainRect.sizeDelta = new Vector2(this.socialIsVisible ? -400 : 0, mainRect.sizeDelta.y);
		mainRect.TweenAnchoredPositionX(this.socialIsVisible ? -200 : 0, this.socialTweenDuration);
	}
}
