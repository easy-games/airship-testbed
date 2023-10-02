import { Controller, OnStart } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { Keyboard, Mouse } from "Shared/UserInput";
import { AppManager } from "Shared/Util/AppManager";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { SetTimeout } from "Shared/Util/Timer";
import { AuthController } from "./Auth/AuthController";
import { MainMenuPage } from "./MainMenuPageName";

@Controller()
export class MainMenuController implements OnStart {
	public mainMenuGo: GameObject;
	public refs: GameObjectReferences;
	public currentPageGo: GameObject | undefined;
	public currentPage = MainMenuPage.HOME;
	public OnCurrentPageChanged = new Signal<[page: MainMenuPage, oldPage: MainMenuPage | undefined]>();
	private pageMap: Record<MainMenuPage, GameObject>;
	private wrapperRect: RectTransform;

	public mainContentCanvas: Canvas;
	private rootCanvasGroup: CanvasGroup;

	public socialMenuCanvas: Canvas;

	private open = false;

	constructor(private readonly authController: AuthController) {
		const mainMenuPrefab = AssetBridge.Instance.LoadAsset("Imports/Core/Client/Resources/MainMenu/MainMenu.prefab");
		this.mainMenuGo = Object.Instantiate(mainMenuPrefab) as GameObject;
		this.refs = this.mainMenuGo.GetComponent<GameObjectReferences>();
		const wrapperGo = this.refs.GetValue("UI", "Wrapper");
		this.wrapperRect = wrapperGo.GetComponent<RectTransform>();
		this.rootCanvasGroup = this.mainMenuGo.GetComponent<CanvasGroup>();
		this.mainContentCanvas = this.mainMenuGo.transform.GetChild(0).GetComponent<Canvas>();
		this.socialMenuCanvas = this.mainMenuGo.transform.GetChild(1).GetComponent<Canvas>();

		this.pageMap = {
			[MainMenuPage.HOME]: this.refs.GetValue("Pages", "Home"),
			[MainMenuPage.SETTINGS]: this.refs.GetValue("Pages", "Settings"),
		};

		for (const page of ObjectUtil.keys(this.pageMap)) {
			if (page === this.currentPage) {
				this.pageMap[page].SetActive(true);
			} else {
				this.pageMap[page].SetActive(false);
			}
		}

		const closeButton = this.refs.GetValue("UI", "CloseButton");
		if (Game.Context === CoreContext.MAIN_MENU) {
			const mouse = new Mouse();
			mouse.AddUnlocker();

			closeButton.SetActive(false);
		} else {
			const bg = this.refs.GetValue("UI", "Background");
			bg.GetComponent<Image>().color = new Color(1, 1, 1, 0.98);

			CanvasAPI.OnClickEvent(closeButton, () => {
				AppManager.Close();
			});
		}
	}

	public OpenFromGame(): void {
		if (this.open) return;

		AppManager.OpenCustom(() => {
			this.CloseFromGame();
		});
		this.open = true;
		const duration = 0.06;
		this.wrapperRect.localScale = new Vector3(1.1, 1.1, 1.1);
		this.wrapperRect.TweenLocalScale(new Vector3(1, 1, 1), duration);
		this.mainContentCanvas.enabled = true;
		this.socialMenuCanvas.enabled = true;
		this.rootCanvasGroup.TweenCanvasGroupAlpha(1, duration);
	}

	public CloseFromGame(): void {
		if (!this.open) return;
		this.open = false;

		const duration = 0.06;
		this.wrapperRect.TweenLocalScale(new Vector3(1.1, 1.1, 1.1), duration);
		this.rootCanvasGroup.TweenCanvasGroupAlpha(0, duration);
		SetTimeout(duration, () => {
			if (!this.open) {
				this.mainContentCanvas.enabled = false;
				this.socialMenuCanvas.enabled = false;
			}
		});
	}

	public IsOpen(): boolean {
		return this.open;
	}

	OnStart(): void {
		if (this.currentPageGo === undefined) {
			this.RouteToPage(MainMenuPage.HOME, true, true);
		}

		if (Game.Context === CoreContext.GAME) {
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

	public RouteToPage(page: MainMenuPage, force = false, noTween = false) {
		if (this.currentPage === page && !force) {
			return;
		}

		// Tween out old page
		const oldPage = this.currentPage;
		const oldPageGo = this.currentPageGo;
		if (oldPageGo) {
			// oldPageGo.GetComponent<RectTransform>().TweenLocalPosition(new Vector3(-20, 0, 0), 0.1);
			oldPageGo.GetComponent<CanvasGroup>().TweenCanvasGroupAlpha(0, 0);
			SetTimeout(0.1, () => {
				if (this.currentPageGo !== oldPageGo) {
					oldPageGo.SetActive(false);
				}
			});
		}

		this.currentPageGo = this.pageMap[page];
		this.currentPageGo.SetActive(true);
		this.currentPage = page;

		// Update to new page
		const canvasGroup = this.currentPageGo.GetComponent<CanvasGroup>();
		if (noTween) {
			this.currentPageGo.transform.localPosition = new Vector3(0, 0, 0);
			canvasGroup.alpha = 1;
		} else {
			this.currentPageGo.transform.localPosition = new Vector3(0, -20, 0);
			this.currentPageGo.GetComponent<RectTransform>().TweenLocalPosition(new Vector3(0, 0, 0), 0.1);
			canvasGroup.alpha = 0;
			canvasGroup.TweenCanvasGroupAlpha(1, 0.1);
		}

		this.OnCurrentPageChanged.Fire(this.currentPage, oldPage);
	}
}
