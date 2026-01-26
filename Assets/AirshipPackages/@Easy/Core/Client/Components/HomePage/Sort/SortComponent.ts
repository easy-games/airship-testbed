import { AirshipGame } from "@Easy/Core/Shared/Airship/Types/AirshipGame";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import HomePageGameComponent from "./HomePageGameComponent";

export default class SortComponent extends AirshipBehaviour {
	public titleText!: GameObject;
	public content!: Transform;
	public gamePrefab!: GameObject;
	public pageScrollRect?: ScrollRect;
	public gridLayoutGroup!: GridLayoutGroup;
	public layoutElement!: LayoutElement;
	public refreshBtn: Button;
	@NonSerialized() public isRefreshing = false;

	@NonSerialized() public gameMap = new Map<string, HomePageGameComponent>();
	@NonSerialized() public games: AirshipGame[] = [];

	/**
	 * Will show spinner while this signal yields.
	 */
	public onRequestRefresh = new Signal().WithAllowYield(true);

	private bin = new Bin();

	override Awake(): void {
		this.Clear();
		this.titleText.SetActive(false);
		this.refreshBtn.gameObject.SetActive(false);
	}

	public OnEnable(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((sizeType, size) => {
				const parentTransform = this.transform.parent as RectTransform;
				const parentWidth = parentTransform.sizeDelta.x;

				if (Game.IsPortrait()) {
					this.gridLayoutGroup.cellSize = new Vector2(size.x * 0.97, size.x * 0.97 * 0.56 + 54);
					this.gridLayoutGroup.constraintCount = 1;
					this.titleText.GetComponent<TMP_Text>()!.margin = new Vector4(8, 0, 0, 0);
					this.gridLayoutGroup.padding.left = 8;
					this.gridLayoutGroup.padding.right = 4;
				} else {
					let spacing = 40;
					let inverseAspectRatio = 234 / 320; // height / width
					// -4 is because sort component has some padding to make sure shadows don't get masked
					let width = (parentWidth - spacing * 2) / 3 - 4;
					let height = width * inverseAspectRatio;
					this.gridLayoutGroup.cellSize = new Vector2(width, height);
					this.gridLayoutGroup.constraintCount = 3;
				}
				Bridge.UpdateLayout(this.content, true);
				this.UpdatePreferredHeight();
			}),
		);

		this.bin.Add(
			this.refreshBtn.onClick.Connect(() => {
				if (this.isRefreshing) return;
				this.isRefreshing = true;
				const loadingBin = new Bin();

				let spinTime = 0.4;
				this.refreshBtn.transform.rotation = Quaternion.identity;
				NativeTween.RotationZ(this.refreshBtn.transform, 180, spinTime).SetEaseQuadOut();

				task.spawn(() => {
					try {
						this.onRequestRefresh.Fire();
					} catch (err) {
						warn(err);
					}
					this.isRefreshing = false;
					loadingBin.Clean();
				});
			}),
		);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	override Start(): void {}

	override OnDestroy(): void {}

	public Init(title: string): void {
		this.SetTitle(title);
	}

	public Clear(): void {
		this.content.gameObject.ClearChildren();
	}

	public UpdatePreferredHeight(): void {
		if (this.games.size() === 0) {
			this.layoutElement.preferredHeight = 0;
			this.layoutElement.minHeight = 0;
			if (this.pageScrollRect) {
				Bridge.UpdateLayout(this.pageScrollRect.transform, true);
			}
			return;
		}
		let rows = math.ceil(this.games.size() / this.gridLayoutGroup.constraintCount);

		this.layoutElement.preferredHeight =
			rows * (this.gridLayoutGroup.cellSize.y + this.gridLayoutGroup.spacing.y) +
			40 + // title
			50; // bottom padding
		this.layoutElement.minHeight = this.layoutElement.preferredHeight;
		if (this.pageScrollRect) {
			Bridge.UpdateLayout(this.pageScrollRect.transform.parent, true);
		}
	}

	public SetGames(games: AirshipGame[], indexOffset: number): HomePageGameComponent[] {
		this.games = games;

		let hasGames = games.size() > 0;
		this.titleText.gameObject.SetActive(hasGames);
		this.refreshBtn.gameObject.SetActive(hasGames);

		this.content.gameObject.ClearChildren();
		let gameComponents: HomePageGameComponent[] = [];
		let i = indexOffset;
		for (const gameDto of games) {
			// const gameGo = PoolManager.SpawnObject(
			// 	this.gamePrefab,
			// 	this.gamePrefab.transform.localPosition,
			// 	this.gamePrefab.transform.localRotation,
			// 	this.content,
			// );
			// gameGo.transform.localScale = Vector3.one;
			const gameGo = Object.Instantiate(this.gamePrefab, this.content) as GameObject;
			const gameComponent = gameGo.GetAirshipComponent<HomePageGameComponent>();
			if (gameComponent) {
				this.gameMap.set(gameDto.id, gameComponent);
				gameComponent.Init(gameDto, i);
				if (this.pageScrollRect) {
					gameComponent.SetDragRedirectTarget(this.pageScrollRect);
				}
				gameComponents.push(gameComponent);
			}
			i++;
		}
		this.UpdatePreferredHeight();
		return gameComponents;
	}

	/**
	 *
	 * @param gameId
	 * @param playerCount
	 * @returns True if a game with matching gameId was found.
	 */
	public UpdateGamePlayerCount(gameId: string, playerCount: number): boolean {
		const gameComponent = this.gameMap.get(gameId);
		if (gameComponent) {
			gameComponent.UpdatePlayerCount(playerCount);
			return true;
		}
		return false;
	}

	public SetTitle(title: string) {
		this.titleText.GetComponent<TMP_Text>()!.text = title;
	}
}
