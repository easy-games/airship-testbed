import { Airship } from "../../Airship";
import { PublicUser } from "../../Airship/Types/Outputs/AirshipUser";
import { Game } from "../../Game";
import { Protected } from "../../Protected";
import { Bin } from "../../Util/Bin";

export default class PartyMember extends AirshipBehaviour {
	public profileImage!: RawImage;
	private user!: PublicUser;

	private bin = new Bin();

	override Start(): void {}

	public SetUser(user: PublicUser, asLeader: boolean): void {
		this.bin.Clean();
		this.user = user;

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
			await this.UpdatePicture();
		});
		if (user.uid === Game.localPlayer?.userId) {
			this.bin.Add(
				Protected.user.onLocalUserUpdated.Connect(() => {
					this.UpdatePicture().then(() => {});
				}),
			);
		}
	}

	public async UpdatePicture() {
		if (this.user) {
			const profileTexture = await Airship.players.GetProfilePictureTextureFromImageIdAsync(
				this.user.uid,
				this.user.profileImageId,
			);
			if (profileTexture) {
				this.profileImage.texture = profileTexture;
			}
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
