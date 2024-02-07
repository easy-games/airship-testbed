import { Game } from "../../Game";
import { PublicUser } from "../../SocketIOMessages/PublicUser";
import { AirshipUrl } from "../../Util/AirshipUrl";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";
import { EncodeJSON } from "../../json";

export default class PartyMember extends AirshipBehaviour {
	public profileImage!: Image;
	public usernameText!: TMP_Text;
	public kickButton!: Button;

	private bin = new Bin();

	override Start(): void {}

	public SetUser(user: PublicUser, asLeader: boolean): void {
		this.bin.Clean();

		this.usernameText.text = user.username;

		if (asLeader && user.uid !== Game.localPlayer.userId) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnClickEvent(this.kickButton.gameObject, () => {
					InternalHttpManager.PostAsync(
						AirshipUrl.GameCoordinator + "/parties/party/remove",
						EncodeJSON({
							userToRemove: user.uid,
						}),
					);
				}),
			);
		} else {
			this.kickButton.gameObject.SetActive(false);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
