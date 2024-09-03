import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { GameDto } from "../API/GamesAPI";
import HomePageGameComponent from "./HomePageGameComponent";

export default class SortComponent extends AirshipBehaviour {
	public titleText!: GameObject;
	public content!: Transform;
	public gamePrefab!: GameObject;
	public pageScrollRect?: ScrollRect;
	public gridLayoutGroup!: GridLayoutGroup;
	public layoutElement!: LayoutElement;

	private bin = new Bin();

	override Awake(): void {
		this.Clear();
	}

	public OnEnable(): void {
		const rect = this.gameObject.GetComponent<RectTransform>()!;
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((sizeType, size) => {
				if (sizeType === "sm") {
					if (Game.IsPortrait()) {
						this.gridLayoutGroup.cellSize = new Vector2(size.x * 0.97, size.x * 0.97 * 0.56 + 54);
						this.gridLayoutGroup.constraintCount = 1;
					} else {
						this.gridLayoutGroup.cellSize = new Vector2(size.x * 0.28, size.x * 0.28 * 0.56 + 54);
						this.gridLayoutGroup.constraintCount = 2;
					}
				} else {
					this.gridLayoutGroup.cellSize = new Vector2(320, 234);
					this.gridLayoutGroup.constraintCount = 3;
				}
				Bridge.UpdateLayout(this.content, true);
				this.UpdatePreferredHeight();
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
		let rows = math.ceil(this.content.childCount / this.gridLayoutGroup.constraintCount);

		this.layoutElement.preferredHeight =
			rows * (this.gridLayoutGroup.cellSize.y + this.gridLayoutGroup.spacing.y) +
			40 + // title
			50; // bottom padding
		if (this.pageScrollRect) {
			Bridge.UpdateLayout(this.pageScrollRect.transform, true);
		}
	}

	public SetGames(games: GameDto[], indexOffset: number): HomePageGameComponent[] {
		this.titleText.gameObject.SetActive(games.size() > 0);

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

	public SetTitle(title: string) {
		this.titleText.GetComponent<TMP_Text>()!.text = title;
	}
}
