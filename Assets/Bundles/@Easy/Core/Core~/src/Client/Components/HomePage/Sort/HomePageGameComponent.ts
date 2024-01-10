import { Dependency } from "@easy-games/flamework-core";
import { TransferController } from "Client/MainMenuControllers/Transfer/TransferController";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText!: TMP_Text;
	public playerCountText!: TMP_Text;
	public buttonGo!: GameObject;

	private bin = new Bin();

	override Start(): void {}

	override OnDestroy(): void {}

	public OnDisabled(): void {
		this.bin.Clean();
	}

	public Init(gameDto: GameDto) {
		this.titleText.text = gameDto.name;
		if (gameDto.liveStats?.playerCount !== undefined) {
			this.playerCountText.text = gameDto.liveStats.playerCount + "";
		} else {
			this.playerCountText.text = "???";
		}

		let url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".jpg";

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

		const clickConn = CanvasAPI.OnClickEvent(this.buttonGo, () => {
			Dependency<TransferController>().TransferToGameAsync(gameDto.id);
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(clickConn);
		});
	}
}
