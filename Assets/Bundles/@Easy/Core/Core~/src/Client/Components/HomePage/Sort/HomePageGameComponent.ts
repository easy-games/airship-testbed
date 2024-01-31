import { Dependency } from "@easy-games/flamework-core";
import { TransferController } from "Client/MainMenuControllers/Transfer/TransferController";
import DateParser from "Shared/DateParser";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText!: TMP_Text;
	public playerCountText!: TMP_Text;
	public buttonGo!: GameObject;
	public orgImage!: RemoteImage;
	public authorText!: TMP_Text;

	@SerializeField()
	private redirectDrag!: AirshipRedirectDrag;

	private bin = new Bin();

	override Start(): void {}

	override OnDestroy(): void {}

	public OnDisabled(): void {
		this.bin.Clean();
	}

	public SetDragRedirectTarget(target: ScrollRect): void {
		this.redirectDrag.redirectTarget = target;
	}

	public Init(gameDto: GameDto) {
		this.titleText.text = gameDto.name;
		if (gameDto.liveStats?.playerCount !== undefined) {
			this.playerCountText.text = gameDto.liveStats.playerCount + "";
		} else {
			this.playerCountText.text = "???";
		}

		{
			// Game image
			let url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".jpg";
			let remoteImage = this.gameObject.transform.GetChild(0).GetComponent<RemoteImage>();
			remoteImage.url = url;
			remoteImage.StartDownload();
			const downloadConn = remoteImage.OnFinishedLoading((success) => {
				if (success) {
					remoteImage.image.TweenGraphicColor(new Color(1, 1, 1, 1), 0.2);
				} else {
					remoteImage.image.TweenGraphicColor(new Color(0, 0, 0, 0.3), 0.2);
				}
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(downloadConn);
			});
		}

		const timeUpdatedSeconds = DateParser.FromISO(gameDto.lastVersionUpdate!);
		const timeDiff = os.time() - timeUpdatedSeconds;
		const timeString = TimeUtil.FormatTimeAgo(timeDiff, {
			includeAgo: true,
		});
		this.authorText.text = `${gameDto.organization.name} • ${timeString}`;

		{
			// Org image
			let url = AirshipUrl.CDN + "/images/" + gameDto.organization.iconImageId + ".jpg";
			this.orgImage.url = url;
			this.orgImage.StartDownload();
			const downloadConn = this.orgImage.OnFinishedLoading((success) => {
				if (success) {
					this.orgImage.image.TweenGraphicColor(new Color(1, 1, 1, 1), 0.2);
				} else {
					this.orgImage.image.TweenGraphicColor(new Color(0, 0, 0, 0.3), 0.2);
				}
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(downloadConn);
			});
		}

		const clickConn = CanvasAPI.OnClickEvent(this.buttonGo, () => {
			if (this.redirectDrag.isDragging) return;
			Dependency<TransferController>().TransferToGameAsync(gameDto.id);
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(clickConn);
		});
	}
}
