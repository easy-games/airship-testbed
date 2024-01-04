import { GameDto } from "../API/GamesAPI";
import HomePageGameComponent from "./HomePageGameComponent";

export default class SortComponent extends AirshipBehaviour {
	public titleText!: GameObject;
	public content!: Transform;
	public gamePrefab!: GameObject;

	override Awake(): void {
		this.Clear();
	}

	override Start(): void {}

	override OnDestroy(): void {}

	public Init(title: string): void {
		this.SetTitle(title);
	}

	public Clear(): void {
		this.content.gameObject.ClearChildren();
	}

	public SetGames(games: GameDto[]): void {
		this.content.gameObject.ClearChildren();

		for (const gameDto of games) {
			const gameGo = Object.Instantiate(this.gamePrefab, this.content) as GameObject;
			const gameComponent = gameGo.GetComponent<HomePageGameComponent>();
			gameComponent.Init(gameDto);
		}
	}

	public SetTitle(title: string) {
		this.titleText.GetComponent<TMP_Text>().text = title;
	}
}
