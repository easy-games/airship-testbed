import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { GameCoordinatorClient, GameCoordinatorParty } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ProtectedFriendsController } from "../../Social/FriendsController";
import { PendingSocialNotification } from "../../Social/PendingSocialNotification";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class PartyModalInvite extends AirshipBehaviour {
	public leaderAvatarImg: RawImage;
	public leaderUsername: TMP_Text;
	public othersText: TMP_Text;
	public denyBtn: Button;
	public acceptBtn: Button;

	private bin = new Bin();

	public Init(notif: PendingSocialNotification, party: GameCoordinatorParty.PartySnapshot): void {
		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(party.leader, true, party.members.find((u) => u.uid === party.leader)?.profileImageId);
			this.leaderAvatarImg.texture = tex;
		});
		const leaderMember = party.members.find((m) => m.uid === party.leader)!;
		this.leaderUsername.text = leaderMember.username;

		if (party.members.size() > 1) {
			this.othersText.gameObject.SetActive(true);
			this.othersText.text = `+${party.members.size() - 1} others`;
		} else {
			this.othersText.gameObject.SetActive(false);
		}

		this.bin.Add(
			this.acceptBtn.onClick.Connect(async () => {
				await client.party.joinParty(party);
				Dependency<ProtectedFriendsController>().ClearPendingNotification(notif);
				Destroy(this.gameObject);
			}),
		);

		this.bin.Add(
			this.denyBtn.onClick.Connect(() => {
				Dependency<ProtectedFriendsController>().ClearPendingNotification(notif);
				Destroy(this.gameObject);
			}),
		);
	}

	override Start(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
