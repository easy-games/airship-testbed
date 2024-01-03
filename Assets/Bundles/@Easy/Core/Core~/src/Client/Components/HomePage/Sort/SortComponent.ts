import { GameDto } from "../API/GamesAPI";
import HomePageGameComponent from "./HomePageGameComponent";

export default class SortComponent extends AirshipBehaviour {
	public titleText!: GameObject;
	public content!: Transform;
	public gamePrefab!: GameObject;
	public backendName!: string;

	override OnAwake(): void {
		this.content.gameObject.ClearChildren();
	}

	override OnStart(): void {}

	override OnDestroy(): void {}

	public Setup(title: string, backendName: string): void {
		this.SetTitle(title);
		this.backendName = backendName;
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
