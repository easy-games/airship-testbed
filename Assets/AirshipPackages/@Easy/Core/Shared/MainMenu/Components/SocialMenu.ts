import { Game } from "../../Game";
import { AirshipUrl } from "../../Util/AirshipUrl";
import { Bin } from "../../Util/Bin";
import { SetInterval } from "../../Util/Timer";

export default class SocialMenu extends AirshipBehaviour {
	public liveStats!: GameObject;
	public playerCountText!: TMP_Text;
	public serverCountText!: TMP_Text;

	public verticalLayout!: GameObject;

	@Header("Lost Connection")
	public lostConnectionNotice!: GameObject;
	public reconnectButton!: Button;
	public logoutbutton!: Button;

	private bin = new Bin();

	override Start(): void {
		if (Game.deviceType === AirshipDeviceType.Phone) {
			this.liveStats.gameObject.SetActive(false);
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

		// const socketController = Dependency<SocketController>();
		// this.bin.Add(
		// 	socketController.onSocketConnectionChanged.Connect((connected) => {
		// 		this.verticalLayout.gameObject.SetActive(connected);
		// 		this.lostConnectionNotice.SetActive(!connected);
		// 	}),
		// );
	}

	private FetchLiveStats(): void {
		const res = InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/stats");
		if (!res.success) return;

		const data = json.decode<{
			players: {
				online: number;
				inGame: number;
			};
			games: {
				active: number;
			};
		}>(res.data);
		this.playerCountText.text = `${data.players.online} Players Connected`;
		this.serverCountText.text = `${data.games.active} Servers Online`;
	}

	override OnDestroy(): void {}
}
