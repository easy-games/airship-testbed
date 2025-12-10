import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { AirshipGameVisibility } from "@Easy/Core/Shared/Airship/Types/AirshipGame";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { TweenEasingFunction } from "@Easy/Core/Shared/Tween/EasingFunctions";
import { Tween } from "@Easy/Core/Shared/Tween/Tween";
import { ContentServiceGames } from "@Easy/Core/Shared/TypePackages/content-service-types";
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
	public popoutImage: RawImage;
	public contentLayoutGroup: HorizontalLayoutGroup;

	@NonSerialized()
	private popoutImageUrl: string;

	private startTime: number;
	private endTime: number;

	private enableBin = new Bin();

	public async Init(
		gameId: string,
		description: string,
		popoutImageUrl: string,
		startTime: number,
		endTime: number,
	): Promise<void> {
		this.startTime = startTime;
		this.endTime = endTime;
		this.popoutImageUrl = popoutImageUrl;

		this.gameThumbnailImg.color = new Color(1, 1, 1, 0);
		this.eventImg.color = new Color(1, 1, 1, 0);
		this.playerCountText.text = "0";
		this.popoutImage.color = new Color(1, 1, 1, 0);

		if (Game.deviceType === AirshipDeviceType.Phone) {
			this.popoutImage.transform.localScale = new Vector3(0.9, 0.9, 0.9);
			const rect = this.popoutImage.transform as RectTransform;
			// rect.anchoredPosition = new Vector2(24, 0);
		}

		if (eventCache) {
			this.LoadGameImages(eventCache);
		}
		this.LoadPopoutImages();

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

		if (Game.deviceType === AirshipDeviceType.Phone) {
			this.gameThumbnailImg.gameObject.SetActive(false);
			this.roundedCorners.radius = 0;
			this.roundedCorners.Validate();
			this.borderBottom.SetActive(true);
			this.contentLayoutGroup.padding.left = -5;
		} else {
			this.borderBottom.SetActive(false);
		}
	}

	private UpdateTimers(): void {
		// hasn't Init yet
		if (this.startTime === undefined) return;

		let preEvent = os.time() < this.startTime;
		let postEvent = os.time() > this.endTime;
		let gamePublic = eventCache?.visibility === AirshipGameVisibility.PUBLIC;

		if (preEvent || !gamePublic) {
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
			this.endCountdownText.gameObject.SetActive(false);
			this.playerCountWrapper.SetActive(true);
			this.playBtn.gameObject.SetActive(true);

			// let timeLeft = math.round(this.endTime - os.time());
			// let countdown = TimeUtil.FormatCountdown(timeLeft, {
			// 	seconds: true,
			// 	minutes: true,
			// 	hours: true,
			// 	days: true,
			// 	seperator: " : ",
			// });
			// this.endCountdownText.text = `Ends in ${countdown}`;
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

			this.LoadGameImages(res.game as ContentServiceGames.PublicGameWithLiveStatsAndOrg);
		}
	}

	private LoadPopoutImages(): void {
		task.spawn(async () => {
			const url = this.popoutImageUrl;
			const tex = await Protected.Cache.DownloadImage(url);
			if (tex) {
				this.popoutImage.texture = tex;
				this.popoutImage.color = Color.white;
			}
		});
	}

	private LoadGameImages(gameDto: ContentServiceGames.PublicGameWithLiveStatsAndOrg): void {
		// Game Thumbnail
		task.spawn(async () => {
			const url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".png";
			const tex = await Protected.Cache.DownloadImage(url);
			if (tex) {
				this.gameThumbnailImg.texture = tex;
				this.gameThumbnailImg.color = Color.white;
			}
		});

		// Event BG
		task.spawn(async () => {
			const url = AirshipUrl.CDN + "/airship/Topology3.png";
			const tex = await Protected.Cache.DownloadImage(url);
			if (tex) {
				this.eventImg.texture = tex;
				this.eventImg.color = Color.white;
			}
		});
	}

	protected OnDisable(): void {
		this.enableBin.Clean();
	}

	override Start(): void {}

	override OnDestroy(): void {}
}
