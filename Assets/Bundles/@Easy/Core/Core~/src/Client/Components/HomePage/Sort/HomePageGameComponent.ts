import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText5!: TMP_Text;

	override OnStart(): void {}

	override OnDestroy(): void {}

	public Init(gameDto: GameDto) {
		// this.titleText.GetComponent<TMP_Text>().text = gameDto;
		this.titleText5.text = "Hi";

		const remoteImage = gameObject.GetComponent<RemoteImage>();
		// remoteImage.url = imageUrl;
		remoteImage.StartDownload();
	}
}
