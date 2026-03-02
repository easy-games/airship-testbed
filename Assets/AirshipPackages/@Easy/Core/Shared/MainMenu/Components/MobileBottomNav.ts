import { SocketController } from "@Easy/Core/Client/ProtectedControllers/Socket/SocketController";
import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";

export default class MobileBottomNav extends AirshipBehaviour {
	public socketDisconnectedBadge: GameObject;

	private bin = new Bin();

	override Start(): void {
		const rect = this.transform as RectTransform;
		rect.offsetMax = new Vector2(0, Screen.safeArea.yMin / 2 + 65);

		this.socketDisconnectedBadge?.SetActive(false);

		const socketController = Dependency<SocketController>();
		this.bin.Add(
			socketController.onSocketConnectionChanged.Connect((connected) => {
				this.socketDisconnectedBadge?.SetActive(!connected);
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
