import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText5!: TMP_Text;
	public remoteImage!: RemoteImage;

	override OnStart(): void {}

	override OnDestroy(): void {}

	public Init(gameDto: GameDto) {
		// this.titleText.GetComponent<TMP_Text>().text = gameDto;
		this.titleText5.text = "Hi";

		let url = AirshipUrl.CDN + gameDto.icon;

		this.remoteImage.url = url;
		this.remoteImage.StartDownload();
	}
}
