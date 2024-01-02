import { Dependency } from "@easy-games/flamework-core";
import { TransferController } from "Client/MainMenuControllers/Transfer/TransferController";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public TitleText!: TMP_Text;
	public PlayerCountText!: TMP_Text;
	public ButtonGo!: GameObject;

	private bin = new Bin();

	override OnStart(): void {}

	override OnDestroy(): void {}

	public OnDisabled(): void {
		this.bin.Clean();
	}

	public Init(gameDto: GameDto) {
		this.TitleText.text = gameDto.name;
		this.PlayerCountText.text = gameDto.liveStats.playerCount + "";

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

		const clickConn = CanvasAPI.OnClickEvent(this.ButtonGo, () => {
			Dependency<TransferController>().ClientTransferToServerAsync(gameDto.id);
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(clickConn);
		});
	}
}
