import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import HomePageComponent from "@Easy/Core/Shared/MainMenu/Components/HomePageComponent";
import GameGeneralPage from "@Easy/Core/Shared/MainMenu/Components/Settings/General/GameGeneralPage";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import AvatarViewComponent from "../../Shared/Avatar/AvatarViewComponent";
import MainMenuPageComponent from "../../Shared/MainMenu/Components/MainMenuPageComponent";
import AvatarMenuComponent from "./AvatarMenu/AvatarMenuComponent";
import DevelopMenuPage from "./Develop/DevelopMenuPage";
import { MainMenuPageType } from "./MainMenuPageName";

@Controller()
export class MainMenuController {
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
	private gameBG?: GameObject;
	private mainMenuBG?: GameObject;

	private open = false;
	private socialIsVisible = true;

	constructor() {
		const mainMenuPrefab = AssetBridge.Instance.LoadAsset(
			"Assets/AirshipPackages/@Easy/Core/Prefabs/MainMenu/MainMenu.prefab",
		);
		this.mainMenuGo = Object.Instantiate(mainMenuPrefab, CoreRefs.protectedTransform) as GameObject;
		this.refs = this.mainMenuGo.GetComponent<GameObjectReferences>()!;
		const wrapperGo = this.refs.GetValue("UI", "Wrapper");
		this.wrapperRect = wrapperGo.GetComponent<RectTransform>()!;
		this.rootCanvasGroup = this.mainMenuGo.GetComponent<CanvasGroup>()!;
		this.mainContentCanvas = this.refs.GetValue<Canvas>("UI", "MainContentCanvas");
		this.mainContentGroup = this.refs.GetValue<CanvasGroup>("UI", "MainContentGroup");
		this.socialMenuGroup = this.refs.GetValue<CanvasGroup>("UI", "SocialGroup");
		CloudImage.ClearCache();

		this.pageMap = new Map<MainMenuPageType, MainMenuPageComponent>([
			[MainMenuPageType.Home, this.refs.GetValue("Pages", "Home").GetAirshipComponent<HomePageComponent>()!],
			[
				MainMenuPageType.Develop,
				this.refs.GetValue("Pages", "Develop").GetAirshipComponent<DevelopMenuPage>()!,
			],
			[
				MainMenuPageType.Avatar,
				this.refs.GetValue("Pages", "Avatar").GetAirshipComponent<AvatarMenuComponent>()!,
			],
			[
				MainMenuPageType.Friends,
				this.refs.GetValue("Pages", "Friends").GetAirshipComponent<MainMenuPageComponent>()!,
			],
			[MainMenuPageType.Game, this.refs.GetValue("Pages", "Game").GetAirshipComponent<GameGeneralPage>()!],
		]);

		this.avatarView = Object.Instantiate(
			this.refs.GetValue<GameObject>("Avatar", "Avatar3DSceneTemplate"),
			CoreRefs.protectedTransform,
		).GetAirshipComponent<AvatarViewComponent>()!;

		if (Game.coreContext === CoreContext.GAME) {
			this.avatarView.HideAvatar();
		} else {
			this.open = true;
		}

		this.gameBG = this.refs.GetValue("UI", "GameBG");
		if (Game.IsMobile()) {
			this.gameBG.GetComponent<Image>()!.color = new Color(0.223, 0.233, 0.264, 1);
		}

		this.mainMenuBG = this.refs.GetValue("UI", "MainMenuBG");
		this.ToggleGameBG(true);

		if (Game.coreContext === CoreContext.MAIN_MENU) {
			const mouse = new Mouse();
			mouse.AddUnlocker();
		}

		contextbridge.callback<() => void>("MainMenu:OpenFromGame", (from) => {
			this.OpenFromGameInProtectedContext();
		});

		// const closeButton = this.refs.GetValue("UI", "CloseButton");
		// if (Game.context === CoreContext.MAIN_MENU) {

		// 	closeButton.SetActive(false);
		// } else {
		// 	CanvasAPI.OnClickEvent(closeButton, () => {
		// 		AppManager.Close();
		// 	});
		// }

		if (Game.coreContext === CoreContext.GAME) {
			this.mainContentCanvas.enabled = false;
		}
	}

	public ToggleGameBG(show: boolean) {
		const isMainMenu = Game.coreContext === CoreContext.MAIN_MENU;
		this.gameBG?.SetActive(show && !isMainMenu);
		this.mainMenuBG?.SetActive(!show || isMainMenu);
	}

	public OpenFromGameInProtectedContext(): void {
		if (this.IsOpen()) return;

		AppManager.OpenCustom(() => {
			this.CloseFromGame();
		});
		this.open = true;
		const duration = 0.06;
		this.wrapperRect.localScale = new Vector3(1.1, 1.1, 1.1);
		NativeTween.LocalScale(this.wrapperRect, new Vector3(1, 1, 1), duration);
		this.mainContentCanvas.enabled = true;
		NativeTween.CanvasGroupAlpha(this.rootCanvasGroup, 1, duration);

		if (this.currentPage) {
			this.RouteToPage(this.currentPage.pageType, true, true);
		}

		//CloudImage.PrintCache();
	}

	public CloseFromGame(): void {
		if (!this.IsOpen()) return;
		this.open = false;

		this.avatarView?.HideAvatar();
		EventSystem.current.ClearSelected();

		const duration = 0.06;
		NativeTween.LocalScale(this.wrapperRect, new Vector3(1.1, 1.1, 1.1), duration);
		NativeTween.CanvasGroupAlpha(this.rootCanvasGroup, 0, duration);
		SetTimeout(duration, () => {
			if (!this.open) {
				this.mainContentCanvas.enabled = false;
			}
		});
	}

	public IsOpen(): boolean {
		return this.open;
	}

	protected OnStart(): void {
		if (this.currentPage === undefined) {
			//init pages
			for (const [key, value] of this.pageMap) {
				if (value) {
					value.Init(this, key);
				}
			}

			if (Game.coreContext === CoreContext.MAIN_MENU) {
				this.RouteToPage(MainMenuPageType.Home, true, true);
			} else {
				this.RouteToPage(MainMenuPageType.Game, true, true);
			}
		} else {
			this.RouteToPage(this.currentPage.pageType, true, true);
		}

		if (Game.coreContext === CoreContext.GAME) {
			// const leaveButton = this.refs.GetValue("UI", "LeaveButton");
			// CoreUI.SetupButton(leaveButton);
			// CanvasAPI.OnClickEvent(leaveButton, () => {
			// 	this.Disconnect();
			// });
		}
	}

	public RouteToPage(pageType: MainMenuPageType, force = false, noTween = false, params?: unknown) {
		if (this.currentPage?.pageType === pageType && !force) {
			return;
		}

		const oldPage = this.currentPage;
		this.currentPage = this.pageMap.get(pageType);

		// Remove old page
		if (oldPage) {
			oldPage.ClosePage();
		}

		if (this.currentPage) {
			this.currentPage.OpenPage(params);
		} else {
			error("Trying to route to undefined page: " + pageType);
		}

		this.onCurrentPageChanged.Fire(pageType, oldPage?.pageType);
	}
}
