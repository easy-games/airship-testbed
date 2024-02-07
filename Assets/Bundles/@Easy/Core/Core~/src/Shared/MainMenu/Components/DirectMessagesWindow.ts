import { FriendStatus } from "@Easy/Core/Client/MainMenuControllers/Social/SocketAPI";
import { Airship } from "../../Airship";
import { PublicUser } from "../../SocketIOMessages/PublicUser";

export default class DirectMessagesWindow extends AirshipBehaviour {
	public offlineNotice!: TMP_Text;
	public headerParty!: GameObject;
	public headerPartyProfilePictures!: GameObject;
	public profilePicturePrefab!: GameObject;
	public messagesParent!: GameObject;

	public headerUser!: GameObject;

	override Start(): void {}

	private Init(): void {
		this.messagesParent.ClearChildren();
	}

	public InitAsFriendChat(user: FriendStatus): void {
		this.Init();
		this.headerParty.SetActive(false);
		this.headerUser.SetActive(true);
	}

	public InitAsPartyChat(members: PublicUser[]): void {
		this.Init();
		this.headerUser.gameObject.SetActive(false);
		this.offlineNotice.gameObject.SetActive(false);

		this.headerParty.SetActive(true);
		this.headerPartyProfilePictures.ClearChildren();
		this.UpdatePartyMembers(members);
	}

	public UpdatePartyMembers(members: PublicUser[]): void {
		const parentTransform = this.headerPartyProfilePictures.transform;
		this.headerPartyProfilePictures.ClearChildren();
		for (let i = members.size() - 1; i >= 0; i--) {
			const member = members[i];
			const go = Object.Instantiate(this.profilePicturePrefab, parentTransform);
			const sprite = Airship.players.CreateProfilePictureSpriteAsync(member.uid);
			if (sprite) {
				go.GetComponent<Image>().sprite = sprite;
			}
		}
	}

	override OnDestroy(): void {}
}
