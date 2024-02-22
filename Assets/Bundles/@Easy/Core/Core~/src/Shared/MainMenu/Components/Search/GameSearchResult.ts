import { TransferController } from "@Easy/Core/Client/MainMenuControllers/Transfer/TransferController";
import DateParser from "@Easy/Core/Shared/DateParser";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";
import { SearchResultDto } from "./SearchAPI";
import SearchResult from "./SearchResult";

export default class GameSearchResult extends SearchResult {
	public gameImage!: Image;
	public gameName!: TMP_Text;
	public gameText!: TMP_Text;
	public list!: RectTransform;

	public Init(searchResult: SearchResultDto): void {
		super.Init(searchResult);

		const gameDto = searchResult.game!;

		this.gameName.text = gameDto.name;

		let playerCountText = "";
		if (gameDto.liveStats?.playerCount ?? 0 > 0) {
			playerCountText = "<color=#23F677>  •  " + gameDto.liveStats!.playerCount! + " online</color>";
		}
		const timeUpdatedSeconds = DateParser.FromISO(gameDto.lastVersionUpdate!);
		const timeDiff = os.time() - timeUpdatedSeconds;
		this.gameText.text =
			`${gameDto.organization.name}  •  ${playerCountText}  •  updated ` +
			TimeUtil.FormatTimeAgo(timeDiff, { includeAgo: true }) +
			`  •  ${gameDto.plays} plays`;

		Bridge.UpdateLayout(this.list, false);

		{
			// Game image
			this.gameImage.color = new Color(0, 0, 0, 0.3);
			let url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".png";
			let cloudImage = this.gameObject.transform.GetChild(0).GetComponent<CloudImage>();
			cloudImage.url = url;
			cloudImage.StartDownload();
			const downloadConn = cloudImage.OnFinishedLoading((success) => {
				if (success) {
					cloudImage.image.TweenGraphicColor(new Color(1, 1, 1, 1), 0.1);
				} else {
					cloudImage.image.TweenGraphicColor(new Color(0, 0, 0, 0.3), 0.1);
				}
			});
			this.bin.Add(() => {
				Bridge.DisconnectEvent(downloadConn);
			});
		}
	}

	override OnSubmit(): void {
		this.MarkAsLoading();
		Dependency<TransferController>().TransferToGameAsync(this.searchResult.game!.id);
	}
}
