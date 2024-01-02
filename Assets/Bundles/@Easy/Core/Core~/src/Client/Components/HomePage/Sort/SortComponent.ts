import { GameDto } from "../API/GamesAPI";
import HomePageGameComponent from "./HomePageGameComponent";

export default class SortComponent extends AirshipBehaviour {
	public TitleText!: GameObject;
	public Content!: Transform;
	public GamePrefab!: GameObject;
	public BackendName!: string;

	override OnAwake(): void {
		this.Content.gameObject.ClearChildren();
	}

	override OnStart(): void {}

	override OnDestroy(): void {}

	public Setup(title: string, backendName: string): void {
		this.SetTitle(title);
		this.BackendName = backendName;
	}

	public SetGames(games: GameDto[]): void {
		this.Content.gameObject.ClearChildren();

		for (const gameDto of games) {
			const gameGo = Object.Instantiate(this.GamePrefab, this.Content) as GameObject;
			const gameComponent = gameGo.GetComponent<HomePageGameComponent>();
			gameComponent.Init(gameDto);
		}
	}

	public SetTitle(title: string) {
		this.TitleText.GetComponent<TMP_Text>().text = title;
	}
}
