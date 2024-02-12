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
	public messagesContent!: GameObject;
	public scrollRect!: ScrollRect;
	public inputField!: TMP_InputField;

	override Start(): void {}

	private Init(): void {
		this.messagesParent.ClearChildren();

		this.gameObject.GetComponent<RectTransform>().TweenAnchoredPositionY(0, 0.1);

		Bridge.UpdateLayout(this.messagesContent.transform, false);
		this.scrollRect.velocity = new Vector2(0, 0);
		this.scrollRect.verticalNormalizedPosition = 0;

		this.inputField!.ActivateInputField();
	}

	public InitAsFriendChat(user: FriendStatus): void {
		this.Init();
		this.headerParty.SetActive(false);
		this.headerUser.SetActive(true);

		this.offlineNotice.gameObject.SetActive(user.status === "offline");
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
