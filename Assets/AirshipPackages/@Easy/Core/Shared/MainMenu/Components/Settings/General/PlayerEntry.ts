import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { MainMenuBlockSingleton } from "@Easy/Core/Client/ProtectedControllers/Settings/MainMenuBlockSingleton";
import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ProtectedPlayer } from "@Easy/Core/Shared/Player/ProtectedPlayer";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class PlayerEntry extends AirshipBehaviour {
	public bgImage!: Image;
	public profileImage!: RawImage;
	public usernameText!: TMP_Text;
	public addFriendBtn!: GameObject;
	public reportBtn!: GameObject;
	public addToPartyBtn!: GameObject;

	private bin = new Bin();

	public OnEnable(): void {}

	public Init(player: ProtectedPlayer): void {
		task.spawn(async () => {
			const texture = await Airship.Players.GetProfilePictureAsync(player.userId);
			if (texture) {
				this.profileImage.texture = texture;
			}

			this.usernameText.text = player.username;

			let showAddFriend = !player.IsLocalPlayer() && !player.IsFriend();

			let showAddParty = false;
			if (!Game.IsEditor()) {
				const party = await Dependency<ProtectedPartyController>().GetParty();
				const partyContainsUser = party.members.find((f) => f.uid === player.userId) !== undefined;
				showAddParty = !player.IsLocalPlayer() && !partyContainsUser;
			}

			this.addFriendBtn.SetActive(showAddFriend);
			if (showAddFriend) {
				this.bin.AddEngineEventConnection(
					CanvasAPI.OnClickEvent(this.addFriendBtn, () => {
						const res = Dependency<ProtectedFriendsController>().SendFriendRequest(player.username);
						if (res) {
							this.addFriendBtn.SetActive(false);
						}
					}),
				);
			}

			this.addToPartyBtn.SetActive(showAddParty);
			if (showAddParty) {
				this.bin.AddEngineEventConnection(
					CanvasAPI.OnClickEvent(this.addToPartyBtn, () => {
						const [res] = Dependency<ProtectedPartyController>().InviteToParty(player.userId).await();
						if (res) {
							this.addToPartyBtn.SetActive(false);
						}
					}),
				);
			}

			this.reportBtn.SetActive(!player.IsLocalPlayer());
			if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(player.userId)) {
				this.reportBtn.GetComponent<Image>()!.color = new Color(1, 1, 1, 0.2);
			}
			// this.bin.AddEngineEventConnection(
			// 	CanvasAPI.OnClickEvent(this.reportBtn, () => {
			// 		task.spawn(() => {
			// 			if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(player.userId)) {
			// 				Dependency<MainMenuBlockSingleton>().UnblockUserAsync(player.userId);
			// 				this.reportBtn.GetComponent<Image>()!.color = new Color(1, 1, 1, 1);
			// 			} else {
			// 				Dependency<MainMenuBlockSingleton>().BlockUserAsync(player.userId, player.username);
			// 				this.reportBtn.GetComponent<Image>()!.color = new Color(1, 1, 1, 0.2);
			// 			}
			// 		});
			// 	}),
			// );
		});
	}

	public SetEven(): void {
		// this.bgImage.color = new Color(0, 0, 0, 0.3);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
