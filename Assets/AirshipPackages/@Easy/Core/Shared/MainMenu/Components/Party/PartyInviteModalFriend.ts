import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class PartyInviteModalFriend extends AirshipBehaviour {
	public username: TMP_Text;
	public avatarImg: RawImage;
	public inviteBtn: Button;
	public invitedText: TMP_Text;

	private bin = new Bin();

	public Init(uid: string, username: string): void {
		this.username.text = username;
		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(uid);
			if (this.avatarImg) {
				this.avatarImg.texture = tex;
				this.avatarImg.color = Color.white;
			}
		});

		this.bin.Add(
			this.inviteBtn.onClick.Connect(() => {
				Dependency<ProtectedPartyController>()
					.InviteToParty(uid)
					.then(() => {
						this.inviteBtn.gameObject.SetActive(false);
						this.invitedText.gameObject.SetActive(true);
					})
					.catch((reason: unknown) => {
						Debug.LogError("Failed to invite to party: " + reason);
					});
			}),
		);
	}

	override Start(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
