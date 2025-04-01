import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers//Social/FriendsController";
import { User } from "@Easy/Core/Client/ProtectedControllers//User/User";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class IncomingFriendRequestCard extends AirshipBehaviour {
	public usernameText!: TMP_Text;
	public profileImage!: RawImage;
	public acceptButton!: Button;
	public declineButton!: Button;

	@NonSerialized() private user!: User;
	private bin = new Bin();

	override Start(): void {}

	public Init(user: User): void {
		this.user = user;
		this.usernameText.text = user.username;

		task.spawn(async () => {
			let texture = await Airship.Players.GetProfilePictureAsync(user.uid);
			if (texture) {
				this.profileImage.texture = texture;
			}
		});

		// Accept
		{
			const conn = CanvasAPI.OnClickEvent(this.acceptButton.gameObject, () => {
				task.spawn(async () => { await this.HandleResult(true) });
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}

		// Decline
		{
			const conn = CanvasAPI.OnClickEvent(this.declineButton.gameObject, () => {
				task.spawn(async () => { await this.HandleResult(false) });
			});
			this.bin.Add(() => Bridge.DisconnectEvent(conn));
		}
	}

	private async HandleResult(result: boolean): Promise<void> {
		const friendsController = Dependency<ProtectedFriendsController>();
		if (result) {
			await friendsController.AcceptFriendRequestAsync(this.user.username, this.user.uid);
		} else {
			await friendsController.RejectFriendRequestAsync(this.user.uid);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
