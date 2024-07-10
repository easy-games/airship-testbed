import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import DateParser from "@Easy/Core/Shared/DateParser";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";
import { SearchResultDto } from "./SearchAPI";
import SearchResult from "./SearchResult";

export default class GameSearchResult extends SearchResult {
	public gameImage!: Image;
	public gameName!: TMP_Text;
	public gameText!: TMP_Text;
	public list!: RectTransform;
	public titlePadding!: RectTransform;

	public OnEnable(): void {
		super.OnEnable();
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.onSizeChanged.Connect((size) => {
				this.UpdateDescriptionText(this.searchResult);
			}),
		);
	}

	public OnDisable(): void {
		super.OnDisable();
		this.bin.Clean();
	}

	public Init(searchResult: SearchResultDto): void {
		super.Init(searchResult);

		const gameDto = searchResult.game!;

		this.gameName.text = gameDto.name;
		this.UpdateDescriptionText(searchResult);

		Bridge.UpdateLayout(this.list, false);

		{
			// Game image
			this.gameImage.color = new Color(0, 0, 0, 0.3);
			let url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".png";
			let cloudImage = this.gameObject.transform.GetChild(0).GetComponent<CloudImage>()!;
			cloudImage.url = url;
			this.bin.AddEngineEventConnection(
				cloudImage.OnFinishedLoading((success) => {
					if (success) {
						NativeTween.GraphicColor(cloudImage.image, new Color(1, 1, 1, 1), 0.1);
					} else {
						NativeTween.GraphicColor(cloudImage.image, new Color(0, 0, 0, 0.3), 0.1);
					}
				}),
			);
			cloudImage.StartDownload();
		}
	}

	public UpdateDescriptionText(searchResult: SearchResultDto): void {
		const size = Dependency<MainMenuSingleton>().sizeType;
		const gameDto = searchResult.game!;

		let playerCountText = "";
		if (gameDto.liveStats?.playerCount ?? 0 > 0) {
			playerCountText = "<color=#23F677>  •  " + gameDto.liveStats!.playerCount! + " online</color>";
		} else {
			playerCountText = "  •  " + gameDto.plays + " plays";
		}

		if (size === "sm") {
			playerCountText = playerCountText.sub(6);
			// this.gameText.text = `${playerCountText}`;
			this.gameText.text = "";
			this.titlePadding.sizeDelta = new Vector2(10, 40);
			return;
		}
		this.titlePadding.sizeDelta = new Vector2(24, 40);

		const timeUpdatedSeconds = DateParser.FromISO(gameDto.lastVersionUpdate!);
		const timeDiff = os.time() - timeUpdatedSeconds;
		this.gameText.text =
			`${gameDto.organization.name}${playerCountText}  •  updated ` +
			TimeUtil.FormatTimeAgo(timeDiff, { includeAgo: true }) +
			`  •  ${gameDto.plays} plays`;
	}

	override OnSubmit(): void {
		this.MarkAsLoading();
		Dependency<TransferController>().TransferToGameAsync(this.searchResult.game!.id);
	}
}
