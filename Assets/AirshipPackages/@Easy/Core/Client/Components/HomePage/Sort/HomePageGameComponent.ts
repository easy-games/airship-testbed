import { TransferController } from "@Easy/Core/Client/ProtectedControllers//Transfer/TransferController";
import { AirshipGame } from "@Easy/Core/Shared/Airship/Types/AirshipGame";
import DateParser from "@Easy/Core/Shared/DateParser";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import SearchSingleton from "@Easy/Core/Shared/MainMenu/Components/Search/SearchSingleton";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";

export default class HomePageGameComponent extends AirshipBehaviour {
	public titleText!: TMP_Text;

	public playsWrapper!: GameObject;
	public playsText!: TMP_Text;

	public playerCountWrapper!: GameObject;
	public playerCountText!: TMP_Text;

	public buttonGo!: GameObject;
	public gameImg: RawImage;
	public orgImg: RawImage;
	public authorText!: TMP_Text;
	public canvasGroup: CanvasGroup;

	public shadow!: TrueShadow;

	public gameDto!: AirshipGame;
	public loadingOverlay!: GameObject;

	@SerializeField()
	private redirectDrag!: AirshipRedirectScroll;

	private index = -1;

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

	protected OnEnable(): void {
		this.canvasGroup.alpha = 0;
		// if (this.index !== -1) {
		// 	this.FadeIn();
		// }
	}

	private FadeIn(): void {
		task.delay(this.index * 0.04, () => {
			// if (this.canvasGroup) return;
			NativeTween.CanvasGroupAlpha(this.canvasGroup, 1, 0.22).SetEaseQuadOut();
			this.transform.localScale = Vector3.one.mul(0.7);
			NativeTween.LocalScale(this.transform, Vector3.one, 0.22).SetEaseQuadOut();
		});
	}

	override OnDestroy(): void {}

	override OnDisable(): void {
		this.bin.Clean();
	}

	public SetDragRedirectTarget(target: ScrollRect): void {
		this.redirectDrag.redirectTarget = target;
	}

	public Init(gameDto: AirshipGame, index: number) {
		this.gameDto = gameDto;
		this.index = index;
		this.transform.gameObject.name = gameDto.name;

		this.titleText.text = gameDto.name;
		const timeUpdatedSeconds = DateParser.FromISO(gameDto.lastVersionUpdate!);
		const timeDiff = os.time() - timeUpdatedSeconds;
		const timeString = TimeUtil.FormatTimeAgo(timeDiff, {
			includeAgo: true,
		});
		this.authorText.text = `${gameDto.organization?.name} • ${timeString}`;

		this.UpdatePlayerCount(gameDto.liveStats?.playerCount ?? 0);

		{
			// Game image
			let url = AirshipUrl.CDN + "/images/" + gameDto.iconImageId + ".png";
			task.spawn(async () => {
				const tex = await Protected.Cache.DownloadImage(url);
				this.gameImg.texture = tex;
				this.gameImg.color = Color.white;
			});
		}

		if (gameDto.organization) {
			// Org image
			let url = AirshipUrl.CDN + "/images/" + gameDto.organization.iconImageId + ".png";
			task.spawn(async () => {
				const tex = await Protected.Cache.DownloadImage(url);
				this.orgImg.texture = tex;
				this.orgImg.color = Color.white;
			});
		}

		const clickConn = CanvasAPI.OnClickEvent(this.buttonGo, async () => {
			if (this.redirectDrag.isDragging) return;
			this.loadingOverlay.SetActive(true);
			print("Joining game " + gameDto.name + "...");
			const res = await Dependency<TransferController>().TransferToGameAsync(gameDto.id);
			this.loadingOverlay.SetActive(false);
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(clickConn);
		});

		this.FadeIn();
	}

	public UpdatePlayerCount(playerCount: number): void {
		if (playerCount > 0) {
			this.playerCountText.text = playerCount + "";
			this.playerCountWrapper.SetActive(true);
			this.playsWrapper.SetActive(false);
		} else {
			this.playsText.text = this.gameDto.plays + "";
			this.playsWrapper.SetActive(true);
			this.playerCountWrapper.SetActive(false);
		}
	}

	public HasAdminPermissions(): boolean {
		return Dependency<SearchSingleton>().myGamesIds.has(this.gameDto.id);
	}
}
