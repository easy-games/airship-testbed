import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText!: GameObject;

	override OnStart(): void {}

	override OnDestroy(): void {}

	public Init(gameDto: GameDto) {
		// this.titleText.GetComponent<TMP_Text>().text = gameDto;

		const remoteImage = gameObject.GetComponent<RemoteImage>();
		// remoteImage.url = imageUrl;
		remoteImage.StartDownload();
	}
}
