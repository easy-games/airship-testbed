import { Airship } from "../../Airship";
import { AirshipUser } from "../../Airship/Types/AirshipUser";

export default class PartyHudMember extends AirshipBehaviour {
	public avatarImg: RawImage;

	public Init(user: AirshipUser): void {
		this.avatarImg.color = new Color(1, 1, 1, 0);
		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(user.uid);
			this.avatarImg.texture = tex;
			this.avatarImg.color = new Color(1, 1, 1, 1);
		});
	}

	public SetLeader(leader: boolean): void {
		if (leader) {
			this.transform.SetAsFirstSibling();
		}
	}

	override Start(): void {}

	override OnDestroy(): void {}
}
