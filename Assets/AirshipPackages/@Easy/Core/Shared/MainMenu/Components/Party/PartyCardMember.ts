import { Airship } from "@Easy/Core/Shared/Airship";
import { GameCoordinatorUsers } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";

export default class PartyCardMember extends AirshipBehaviour {
	public avatarImg: RawImage;
	public crown: GameObject;

	override Start(): void {}

	public Init(user: GameCoordinatorUsers.PublicUser): void {
		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(user.uid);
			if (this.avatarImg) {
				this.avatarImg.texture = tex;
				this.avatarImg.color = Color.white;
			}
		});
	}

	public SetLeader(leader: boolean): void {
		this.crown.SetActive(leader);
		if (leader) {
			this.transform.SetAsFirstSibling();
		}
	}

	override OnDestroy(): void {}
}
