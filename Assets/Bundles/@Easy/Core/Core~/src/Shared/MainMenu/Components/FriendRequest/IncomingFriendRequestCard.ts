import { Dependency } from "@easy-games/flamework-core";
import { FriendsController } from "Client/MainMenuControllers/Social/FriendsController";
import { User } from "Client/MainMenuControllers/User/User";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";

export default class IncomingFriendRequestCard extends AirshipBehaviour {
	public usernameText!: TMP_Text;
	public profileImage!: Image;
	public acceptButton!: Button;
	public declineButton!: Button;

	@NonSerialized() private user!: User;
	private bin = new Bin();

	override Start(): void {}

	public Init(user: User): void {
		this.user = user;
		this.usernameText.text = user.username;
		const texture = AssetBridge.Instance.LoadAssetIfExists<Texture2D>(
			"@Easy/Core/Shared/Resources/Images/ProfilePictures/Dom.png",
		);
		if (texture !== undefined) {
			this.profileImage.sprite = Bridge.MakeSprite(texture);
		}

		// Accept
		{
			const conn = CanvasAPI.OnClickEvent(this.acceptButton.gameObject, () => {
				task.spawn(() => this.HandleResult(true));
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}

		// Decline
		{
			const conn = CanvasAPI.OnClickEvent(this.declineButton.gameObject, () => {
				task.spawn(() => this.HandleResult(false));
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}
	}

	private HandleResult(result: boolean) {
		const friendsController = Dependency<FriendsController>();
		if (result) {
			friendsController.AcceptFriendRequestAsync(this.user.username);
		} else {
			friendsController.RejectFriendRequestAsync(this.user.uid);
		}
		friendsController.SetIncomingFriendRequests(
			friendsController.incomingFriendRequests.filter((u) => u.uid !== this.user.uid),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
