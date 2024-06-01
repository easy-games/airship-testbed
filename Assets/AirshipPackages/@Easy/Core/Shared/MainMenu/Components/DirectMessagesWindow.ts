import { FriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import { Airship } from "../../Airship";
import { PublicUser, UserStatus, UserStatusData } from "../../Airship/Types/Outputs/AirshipUser";
import { Dependency } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class DirectMessagesWindow extends AirshipBehaviour {
	public offlineNotice!: TMP_Text;
	public headerParty!: GameObject;
	public headerPartyProfilePictures!: GameObject;
	public profilePicturePrefab!: GameObject;
	public messagesParent!: GameObject;
	public headerUser!: GameObject;
	public messagesContent!: GameObject;
	public scrollRect!: ScrollRect;
	public inputField!: TMP_InputField;

	public partyTeleportButton!: GameObject;
	public friendTeleportButton!: GameObject;

	private bin = new Bin();

	override Start(): void {}

	private Init(): void {
		this.bin.Clean();
		this.messagesParent.ClearChildren();

		this.gameObject.GetComponent<RectTransform>()!.TweenAnchoredPositionY(75, 0.1);

		Bridge.UpdateLayout(this.messagesContent.transform, false);
		this.scrollRect.velocity = new Vector2(0, 0);
		this.scrollRect.verticalNormalizedPosition = 0;

		this.inputField!.ActivateInputField();
	}

	public InitAsFriendChat(user: UserStatusData): void {
		print("friend chat: " + inspect(user));
		this.Init();
		this.headerParty.SetActive(false);
		this.headerUser.SetActive(true);
		this.partyTeleportButton.SetActive(false);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.friendTeleportButton, () => {
				const friend = Dependency<FriendsController>().GetFriendStatus(user.userId);
				if (friend?.status === UserStatus.IN_GAME && friend?.serverId && friend.gameId) {
					print("Transferring to " + user.username + " on server " + friend.serverId);
					Dependency<TransferController>().TransferToGameAsync(friend.gameId, friend.serverId);
				}
			}),
		);

		const UpdateTeleportButton = (friend: UserStatusData) => {
			let inServer =
				friend.status === UserStatus.IN_GAME && friend.serverId !== undefined && friend.gameId !== undefined;
			this.friendTeleportButton.SetActive(inServer);
		};
		UpdateTeleportButton(user);
		this.bin.Add(
			Dependency<FriendsController>().friendStatusChanged.Connect((friend) => {
				if (friend.userId === user.userId) {
					UpdateTeleportButton(friend);
				}
			}),
		);

		this.offlineNotice.gameObject.SetActive(user.status === "offline");
	}

	public InitAsPartyChat(members: PublicUser[]): void {
		this.Init();
		this.headerUser.gameObject.SetActive(false);
		this.offlineNotice.gameObject.SetActive(false);
		this.friendTeleportButton.SetActive(false);

		this.headerParty.SetActive(true);
		this.headerPartyProfilePictures.ClearChildren();
		this.UpdatePartyMembers(members);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.partyTeleportButton, () => {
				print("Transferring to party leader...");
				Dependency<TransferController>().TransferToPartyLeader();
			}),
		);
	}

	public UpdatePartyMembers(members: PublicUser[]): void {
		const parentTransform = this.headerPartyProfilePictures.transform;
		this.headerPartyProfilePictures.ClearChildren();
		for (let i = members.size() - 1; i >= 0; i--) {
			const member = members[i];
			const go = Object.Instantiate(this.profilePicturePrefab, parentTransform);
			const sprite = Airship.players.GetProfilePictureSpriteAsync(member.uid);
			if (sprite) {
				go.GetComponent<Image>()!.sprite = sprite;
			}
		}
	}

	override OnDestroy(): void {}
}
