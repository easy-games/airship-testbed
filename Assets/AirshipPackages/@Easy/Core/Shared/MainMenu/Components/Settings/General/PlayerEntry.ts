import { MainMenuBlockSingleton } from "@Easy/Core/Client/ProtectedControllers/Settings/MainMenuBlockSingleton";
import { FriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class PlayerEntry extends AirshipBehaviour {
	public bgImage!: Image;
	public profileImage!: Image;
	public usernameText!: TMP_Text;
	public addFriendBtn!: GameObject;
	public reportBtn!: GameObject;

	private bin = new Bin();

	public OnEnable(): void {}

	public Init(player: Player): void {
		task.spawn(() => {
			const profileSprite = Airship.players.GetProfilePictureSpriteAsync(player.userId);
			if (profileSprite) {
				this.profileImage.sprite = profileSprite;
			}

			this.usernameText.text = player.username;

			let showAddFriend = !player.IsLocalPlayer() && !player.IsFriend();
			this.addFriendBtn.SetActive(showAddFriend);
			if (showAddFriend) {
				this.bin.AddEngineEventConnection(
					CanvasAPI.OnClickEvent(this.addFriendBtn, () => {
						const res = Dependency<FriendsController>().SendFriendRequest(player.username);
						if (res) {
							this.addFriendBtn.SetActive(false);
						}
					}),
				);
			}

			this.reportBtn.SetActive(!player.IsLocalPlayer());
			if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(player.userId)) {
				this.reportBtn.GetComponent<Image>()!.color = new Color(1, 1, 1, 0.2);
			}
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnClickEvent(this.reportBtn, () => {
					task.spawn(() => {
						if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(player.userId)) {
							Dependency<MainMenuBlockSingleton>().UnblockUserAsync(player.userId);
							this.reportBtn.GetComponent<Image>()!.color = new Color(1, 1, 1, 1);
						} else {
							Dependency<MainMenuBlockSingleton>().BlockUserAsync(player.userId, player.username);
							this.reportBtn.GetComponent<Image>()!.color = new Color(1, 1, 1, 0.2);
						}
					});
				}),
			);
		});
	}

	public SetEven(): void {
		this.bgImage.color = new Color(0, 0, 0, 0.3);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
