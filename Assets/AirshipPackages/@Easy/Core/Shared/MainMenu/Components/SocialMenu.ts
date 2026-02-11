import { SocketController } from "@Easy/Core/Client/ProtectedControllers/Socket/SocketController";
import { Asset } from "../../Asset";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Protected } from "../../Protected";
import { GameCoordinatorClient } from "../../TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "../../TypePackages/UnityMakeRequest";
import { AirshipUrl } from "../../Util/AirshipUrl";
import { AppManager } from "../../Util/AppManager";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";
import { ChatColor } from "../../Util/ChatColor";
import { SetInterval } from "../../Util/Timer";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class SocialMenu extends AirshipBehaviour {
	public liveStats!: GameObject;
	public playerCountText!: TMP_Text;
	public serverCountText!: TMP_Text;
	public scrollRect: ScrollRect;
	public roundedCorners: ImageWithIndependentRoundedCorners;
	public addFriendBtn: Button;

	public verticalLayout: VerticalLayoutGroup;
	public outline: UIOutline;

	@Header("Lost Connection")
	public lostConnectionNotice!: GameObject;
	public reconnectButton!: Button;
	public logoutbutton!: Button;

	private bin = new Bin();

	@NonSerialized() public rectTransform: RectTransform;

	protected Awake(): void {
		this.rectTransform = this.gameObject.GetComponent<RectTransform>()!;
	}

	protected OnEnable(): void {}

	override Start(): void {
		const rect = this.transform as RectTransform;

		if (Game.IsMobile()) {
			if (!Game.IsInGame() && Game.deviceType === AirshipDeviceType.Phone) {
				// Not sure why we need this 0 delay.
				task.delay(0, () => {
					rect.anchorMin = new Vector2(0, 0);
					rect.anchorMax = new Vector2(1, 1);
					rect.pivot = new Vector2(0.5, 1);
					rect.offsetMin = new Vector2(0, 116);
					rect.offsetMax = new Vector2(0, 40);
				});
			}

			this.scrollRect.movementType = MovementType.Elastic;
			this.verticalLayout.padding.bottom = 200;
		}

		this.bin.Add(
			SetInterval(
				10,
				() => {
					task.spawn(() => {
						this.FetchLiveStats();
					});
				},
				true,
			),
		);

		this.bin.Add(
			this.addFriendBtn.onClick.Connect(() => {
				VibrationManager.Play(VibrationFeedbackType.Heavy);
				AppManager.OpenModal(
					Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/Modals/AirshipAddFriendModal.prefab"),
				);
			}),
		);

		const socketController = Dependency<SocketController>();

		// default to connected state to prevent flicker
		this.SetOfflineNoticeVisible(false);

		task.unscaledDelay(2, () => {
			if (!socketController.IsConnected()) {
				this.SetOfflineNoticeVisible(true);
			}
		});

		this.bin.Add(
			socketController.onSocketConnectionChanged.Connect((connected) => {
				this.SetOfflineNoticeVisible(!connected);

				if (!connected && !Game.IsEditor()) {
					// give time to reconnect
					task.delay(2, () => {
						if (!socketController.IsConnected()) {
							Game.localPlayer.SendMessage(
								ChatColor.Red("[Airship] Lost connection to online services."),
							);
						}
					});
				}
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.reconnectButton.gameObject, () => {
				print("Reconnecting...");
				socketController.Connect();
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.logoutbutton.gameObject, () => {
				Protected.User.Logout();
			}),
		);
	}

	public SetOfflineNoticeVisible(visible: boolean): void {
		this.verticalLayout.gameObject.SetActive(!visible);
		this.lostConnectionNotice.SetActive(visible);
		if (Game.IsInGame() && !Game.IsMobile()) {
			const rect = this.lostConnectionNotice.transform as RectTransform;
			rect.anchoredPosition = new Vector2(rect.anchoredPosition.x, -50);
		}
	}

	private FetchLiveStats(): void {
		try {
			const result = client.stats.getStats().expect();
			this.playerCountText.text = `${result.players.online} Players Connected`;
			this.serverCountText.text = `${result.servers.active} Servers Online`;
		} catch {
			return;
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}

	protected OnDisable(): void {}
}
