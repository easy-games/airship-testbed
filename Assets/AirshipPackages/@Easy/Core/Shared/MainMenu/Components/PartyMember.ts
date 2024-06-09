import { Airship } from "../../Airship";
import { PublicUser } from "../../Airship/Types/Outputs/AirshipUser";
import { Bin } from "../../Util/Bin";

export default class PartyMember extends AirshipBehaviour {
	public profileImage!: RawImage;
	// public usernameText!: TMP_Text;
	// public kickButton!: Button;

	private bin = new Bin();

	override Start(): void {}

	public SetUser(user: PublicUser, asLeader: boolean): void {
		this.bin.Clean();

		// this.usernameText.text = user.username;

		// if (asLeader && user.uid !== Game.localPlayer.userId) {
		// 	this.bin.AddEngineEventConnection(
		// 		CanvasAPI.OnClickEvent(this.kickButton.gameObject, () => {
		// 			InternalHttpManager.PostAsync(
		// 				AirshipUrl.GameCoordinator + "/parties/party/remove",
		// 				EncodeJSON({
		// 					userToRemove: user.uid,
		// 				}),
		// 			);
		// 		}),
		// 	);
		// } else {
		// 	this.kickButton.gameObject.SetActive(false);
		// }

		task.spawn(async () => {
			const profileTexture = await Airship.players.GetProfilePictureTextureAsync(user.uid);
			if (profileTexture) {
				this.profileImage.texture = profileTexture;
			}
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
