import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { TransferController } from "Client/MainMenuControllers/Transfer/TransferController";
import DateParser from "Shared/DateParser";
import { Dependency } from "Shared/Flamework";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { GameDto } from "../API/GamesAPI";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText!: TMP_Text;

	public playsWrapper!: GameObject;
	public playsText!: TMP_Text;

	public playerCountWrapper!: GameObject;
	public playerCountText!: TMP_Text;

	public buttonGo!: GameObject;
	public gameImage!: CloudImage;
	public orgImage!: CloudImage;
	public authorText!: TMP_Text;

	public shadow!: TrueShadow;

	public gameDto!: GameDto;
	public loadingOverlay!: GameObject;

	@SerializeField()
	private redirectDrag!: AirshipRedirectDrag;

	private bin = new Bin();

	public Awake(): void {}

	override Start(): void {
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				if (size === "sm") {
					this.shadow.enabled = false;
				} else {
					this.shadow.enabled = true;
				}
			}),
		);
	}

	override OnDestroy(): void {}

	public OnDisabled(): void {
		this.bin.Clean();
	}

	public SetDragRedirectTarget(target: ScrollRect): void {
		this.redirectDrag.redirectTarget = target;
	}

	public Init(gameDto: GameDto) {
		this.gameDto = gameDto;
		this.titleText.text = gameDto.name;
		if (gameDto.liveStats?.playerCount !== undefined && gameDto.liveStats.playerCount > 0) {
			this.playerCountText.text = gameDto.liveStats.playerCount + "";
			this.playerCountWrapper.SetActive(true);
			this.playsWrapper.SetActive(false);
		} else {
			this.playsText.text = gameDto.plays + "";
			this.playsWrapper.SetActive(true);
			this.playerCountWrapper.SetActive(false);
		}

		{
			// Game image
			let url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".png";
			this.gameImage.url = url;
			this.gameImage.image.color = new Color(0, 0, 0, 1);
			const downloadConn = this.gameImage.OnFinishedLoading((success) => {
				if (success) {
					this.gameImage.image.TweenGraphicColor(new Color(1, 1, 1, 1), 0.2);
				} else {
					this.gameImage.image.TweenGraphicColor(new Color(0, 0, 0, 1), 0.2);
				}
			});
			this.gameImage.StartDownload();
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
			let url = AirshipUrl.CDN + "/images/" + gameDto.organization.iconImageId + ".png";
			this.orgImage.url = url;
			this.orgImage.image.color = new Color(0, 0, 0, 0.3);
			const downloadConn = this.orgImage.OnFinishedLoading((success) => {
				if (success) {
					this.orgImage.image.TweenGraphicColor(new Color(1, 1, 1, 1), 0.2);
				} else {
					this.orgImage.image.TweenGraphicColor(new Color(0, 0, 0, 0.3), 0.2);
				}
			});
			this.orgImage.StartDownload();
			this.bin.Add(() => {
				Bridge.DisconnectEvent(downloadConn);
			});
		}

		const clickConn = CanvasAPI.OnClickEvent(this.buttonGo, async () => {
			if (this.redirectDrag.isDragging) return;
			this.loadingOverlay.SetActive(true);
			const res = await Dependency<TransferController>().TransferToGameAsync(gameDto.id);
			this.loadingOverlay.SetActive(false);
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(clickConn);
		});
	}

	public HasAdminPermissions(): boolean {
		return Dependency<SearchSingleton>().myGamesIds.has(this.gameDto.id);
	}
}
