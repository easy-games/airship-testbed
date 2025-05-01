import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { MainMenuBlockSingleton } from "@Easy/Core/Client/ProtectedControllers/Settings/MainMenuBlockSingleton";
import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ProtectedPlayer } from "@Easy/Core/Shared/Player/ProtectedPlayer";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class PlayerEntry extends AirshipBehaviour {
	public bgImage!: Image;
	public profileImage!: RawImage;
	public usernameText!: TMP_Text;

	@Header("Add Friend")
	public addFriendBtn: Button;
	public addFriendOverlay: GameObject;

	@Header("Report")
	public reportBtn: Button;
	public reportOverlay: GameObject;

	@Header("Party Invite")
	public addToPartyBtn: Button;
	public addToPartyOverlay: GameObject;

	@Header("Mute")
	public muteBtn: Button;
	public muteOverlay: GameObject;

	private bin = new Bin();

	public OnEnable(): void {}

	public Init(player: ProtectedPlayer): void {
		this.reportBtn.gameObject.SetActive(false);
		this.addToPartyBtn.gameObject.SetActive(false);
		this.addFriendBtn.gameObject.SetActive(false);

		this.usernameText.text = player.username;

		// Profile picture
		task.spawn(async () => {
			const texture = await Airship.Players.GetProfilePictureAsync(player.userId);
			if (texture) {
				this.profileImage.texture = texture;
			}
		});

		let showAddFriend = !player.IsLocalPlayer() && !player.IsFriend();

		// Party Invite
		task.spawn(async () => {
			let showAddParty = false;
			if (!Game.IsEditor()) {
				const party = await Dependency<ProtectedPartyController>().GetParty();
				const partyContainsUser = party.members.find((f) => f.uid === player.userId) !== undefined;
				showAddParty = !player.IsLocalPlayer() && !partyContainsUser;
			} else {
				showAddParty = !player.IsLocalPlayer();
			}

			this.addToPartyBtn.gameObject.SetActive(showAddParty);
			if (showAddParty) {
				this.bin.AddEngineEventConnection(
					CanvasAPI.OnClickEvent(this.addToPartyBtn.gameObject, () => {
						const [res] = Dependency<ProtectedPartyController>().InviteToParty(player.userId).await();
						if (res) {
							this.addToPartyOverlay.SetActive(true);
						}
					}),
				);
			}
		});

		// Friend Request
		this.addFriendBtn.gameObject.SetActive(showAddFriend);
		if (showAddFriend) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnClickEvent(this.addFriendBtn.gameObject, () => {
					const res = Dependency<ProtectedFriendsController>().SendFriendRequest(player.username);
					if (res) {
						this.addFriendOverlay.SetActive(true);
					}
				}),
			);
		}

		// Report
		this.reportBtn.gameObject.SetActive(!player.IsLocalPlayer());
		if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(player.userId)) {
			this.reportOverlay.SetActive(true);
		}
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.reportBtn.gameObject, () => {
				task.spawn(() => {
					if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(player.userId)) {
						Dependency<MainMenuBlockSingleton>().UnblockUserAsync(player.userId);
						this.reportOverlay.SetActive(false);
					} else {
						Dependency<MainMenuBlockSingleton>().BlockUserAsync(player.userId, player.username);
						this.reportOverlay.SetActive(true);
					}
				});
			}),
		);

		// Mute
		if (!player.IsLocalPlayer()) {
			this.muteBtn.onClick.Connect(() => {
				const currentlyMuted = Protected.VoiceChat.IsMuted(player.userId);
				let newVal = !currentlyMuted;
				Protected.VoiceChat.SetMuted(player.userId, newVal);
				this.muteOverlay.SetActive(newVal);
			});
			if (Protected.VoiceChat.IsMuted(player.userId)) {
				this.muteOverlay.SetActive(true);
			}
		} else {
			this.muteBtn.gameObject.SetActive(false);
		}
	}

	public SetEven(): void {
		// this.bgImage.color = new Color(0, 0, 0, 0.3);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
