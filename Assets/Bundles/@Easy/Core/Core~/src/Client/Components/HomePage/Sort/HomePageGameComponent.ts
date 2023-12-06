import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText!: TMP_Text;
	public playerCountText!: TMP_Text;
	public remoteImage!: RemoteImage;
	private bin = new Bin();

	override OnStart(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}

	public Init(gameDto: GameDto) {
		// this.titleText.GetComponent<TMP_Text>().text = gameDto;
		this.titleText.text = gameDto.name;
		this.playerCountText.text = gameDto.liveStats.playerCount + "";

		let url = AirshipUrl.CDN + gameDto.icon;

		let remoteImage = this.gameObject.transform.GetChild(0).GetComponent<RemoteImage>();
		remoteImage.url = url;
		remoteImage.StartDownload();

		const downloadConn = remoteImage.OnFinishedLoading((success) => {
			if (success) {
				remoteImage.image.color = new Color(1, 1, 1, 1);
			} else {
				remoteImage.image.color = new Color(0, 0, 0, 0.3);
			}
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(downloadConn);
		});
	}
}
