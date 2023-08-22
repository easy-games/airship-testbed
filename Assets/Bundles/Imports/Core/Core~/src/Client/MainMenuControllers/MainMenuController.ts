import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import ObjectUtil from "@easy-games/unity-object-utils";
import { Mouse } from "Shared/UserInput";
import { Signal } from "Shared/Util/Signal";
import { SetTimeout } from "Shared/Util/Timer";
import { MainMenuPage } from "./MainMenuPageName";

@Controller({})
export class MainMenuController implements OnStart {
	public mainMenuGo: GameObject;
	public refs: GameObjectReferences;
	public currentPageGo: GameObject | undefined;
	public currentPage = MainMenuPage.HOME;
	public OnCurrentPageChanged = new Signal<[page: MainMenuPage, oldPage: MainMenuPage | undefined]>();
	private pageMap: Record<MainMenuPage, GameObject>;

	constructor() {
		const mainMenuPrefab = AssetBridge.LoadAsset("Imports/Core/Client/Resources/MainMenu/MainMenu.prefab");
		this.mainMenuGo = Object.Instantiate(mainMenuPrefab) as GameObject;

		this.refs = this.mainMenuGo.GetComponent<GameObjectReferences>();

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

		const mouse = new Mouse();
		mouse.AddUnlocker();
	}

	OnStart(): void {
		if (this.currentPageGo === undefined) {
			this.RouteToPage(MainMenuPage.HOME, true, true);
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
		print("routing to page: " + page);
		print("currentPage: " + inspect(this.currentPageGo));
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
