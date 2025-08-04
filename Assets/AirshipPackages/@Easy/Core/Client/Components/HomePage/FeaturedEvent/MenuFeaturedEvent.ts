import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { TweenEasingFunction } from "@Easy/Core/Shared/Tween/EasingFunctions";
import { Tween } from "@Easy/Core/Shared/Tween/Tween";
import { ContentServiceGames, ContentServicePrisma } from "@Easy/Core/Shared/TypePackages/content-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";

const gamesClient = new ContentServiceGames.Client(UnityMakeRequest(AirshipUrl.ContentService));
let eventCache: ContentServiceGames.PublicGameWithLiveStatsAndOrg | undefined;

export default class MenuFeaturedEvent extends AirshipBehaviour {
	@Header("References")
	public eventImg: RawImage;
	public gameThumbnailImg: RawImage;
	public gameName: TMP_Text;
	public eventDescription: TMP_Text;
	public playBtn: Button;
	public playerCountWrapper: GameObject;
	public playerCountText: TMP_Text;
	public endCountdownText: TMP_Text;
	public startCountdownText: TMP_Text;
	public roundedCorners: ImageWithRoundedCorners;
	public borderBottom: GameObject;

	private startTime: number;
	private endTime: number;

	private enableBin = new Bin();

	public async Init(gameId: string, description: string, startTime: number, endTime: number): Promise<void> {
		this.startTime = startTime;
		this.endTime = endTime;

		this.gameThumbnailImg.color = new Color(1, 1, 1, 0);
		this.eventImg.color = new Color(1, 1, 1, 0);
		this.playerCountText.text = "0";

		if (eventCache) {
			this.LoadImages(eventCache);
		}

		this.eventDescription.text = description;
		this.FetchGame(gameId);
	}

	protected OnEnable(): void {
		this.enableBin.Add(
			SetInterval(
				1,
				() => {
					this.UpdateTimers();
				},
				true,
			),
		);

		if (Game.IsMobile()) {
			this.gameThumbnailImg.gameObject.SetActive(false);
			this.roundedCorners.radius = 0;
			this.roundedCorners.Validate();
			this.borderBottom.SetActive(true);
		} else {
			this.borderBottom.SetActive(false);
		}
	}

	private UpdateTimers(): void {
		// hasn't Init yet
		if (this.startTime === undefined) return;

		let preEvent = os.time() < this.startTime;
		let postEvent = os.time() > this.endTime;
		let gamePublic = eventCache?.visibility === ContentServicePrisma.GameVisibility.PUBLIC;

		if (preEvent) {
			this.startCountdownText.gameObject.SetActive(true);
			this.endCountdownText.gameObject.SetActive(false);
			this.playerCountWrapper.SetActive(false);
			this.playBtn.gameObject.SetActive(false);

			if (preEvent) {
				let timeLeft = math.round(this.startTime - os.time());
				let countdown = TimeUtil.FormatCountdown(timeLeft, {
					seconds: true,
					minutes: true,
					hours: true,
					days: true,
					seperator: " : ",
				});
				this.startCountdownText.text = `Starts in ${countdown}`;
			} else {
				this.startCountdownText.text = `Starting soon...`;
			}
		} else if (postEvent) {
			this.startCountdownText.gameObject.SetActive(true);
			this.endCountdownText.gameObject.SetActive(false);
			this.playerCountWrapper.SetActive(false);
			this.playBtn.gameObject.SetActive(false);

			this.startCountdownText.text = `Event has ended.`;
		} else if (gamePublic) {
			this.startCountdownText.gameObject.SetActive(false);
			this.endCountdownText.gameObject.SetActive(true);
			this.playerCountWrapper.SetActive(true);
			this.playBtn.gameObject.SetActive(true);

			let timeLeft = math.round(this.endTime - os.time());
			let countdown = TimeUtil.FormatCountdown(timeLeft, {
				seconds: true,
				minutes: true,
				hours: true,
				days: true,
				seperator: " : ",
			});
			this.endCountdownText.text = `Ends in ${countdown}`;
		}
	}

	private async FetchGame(gameId: string): Promise<void> {
		const res = await gamesClient.getGameById({
			params: {
				id: gameId,
			},
			query: {
				liveStats: "true",
			},
		});
		if (res.game) {
			eventCache = res.game as ContentServiceGames.PublicGameWithLiveStatsAndOrg;
			this.gameName.text = res.game.name;

			this.playBtn.onClick.Connect(() => {
				task.spawn(async () => {
					const joinRes = await Dependency<TransferController>().TransferToGameAsync(res.game!.id);
				});
			});

			const playerCount = res.game.liveStats?.playerCount ?? 0;
			Tween.Number(
				TweenEasingFunction.OutQuad,
				1,
				(val) => {
					this.playerCountText.text = math.round(val) + "";
				},
				0,
				playerCount,
			);

			this.LoadImages(res.game as ContentServiceGames.PublicGameWithLiveStatsAndOrg);
		}
	}

	private LoadImages(gameDto: ContentServiceGames.PublicGameWithLiveStatsAndOrg): void {
		// Game Thumbnail
		task.spawn(async () => {
			const url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".png";
			const tex = await Protected.Cache.DownloadImage(url);
			if (tex) {
				this.gameThumbnailImg.texture = tex;
				this.gameThumbnailImg.color = new Color(1, 1, 1, 1);
			}
		});

		// Event BG
		task.spawn(async () => {
			const url = "https://cdn.airship.gg/images/dabcaa58-99aa-4eda-9f25-8adff43fc3de";
			const tex = await Protected.Cache.DownloadImage(url);
			if (tex) {
				this.eventImg.texture = tex;
				this.eventImg.color = new Color(1, 1, 1, 1);
			}
		});
	}

	protected OnDisable(): void {
		this.enableBin.Clean();
	}

	override Start(): void {}

	override OnDestroy(): void {}
}
