import { DirectMessageController } from "@Easy/Core/Client/ProtectedControllers/Social/DirectMessages/DirectMessageController";
import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class PartyChatButton extends AirshipBehaviour {
	public badgeText!: TMP_Text;
	public badgeWrapper!: GameObject;

	private bin = new Bin();

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				Dependency<DirectMessageController>().OpenParty();
			}),
		);
	}

	public SetUnreadCount(amount: number): void {
		if (amount === 0) {
			this.badgeWrapper.SetActive(false);
			return;
		}
		this.badgeWrapper.SetActive(true);
		this.badgeText.text = amount + "";
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
