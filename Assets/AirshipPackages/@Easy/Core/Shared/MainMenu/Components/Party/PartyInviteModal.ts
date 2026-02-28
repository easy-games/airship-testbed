import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorUserStatus } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import PartyInviteModalFriend from "./PartyInviteModalFriend";

export default class PartyInviteModal extends AirshipBehaviour {
	public content: RectTransform;
	public playerPrefab: GameObject;
	public subtitle: TMP_Text;
	public noOnlineFriends: GameObject;

	private bin = new Bin();
	private uidToOnlineFriend = new Map<string, PartyInviteModalFriend>();

	override Start(): void {
		this.UpdateList();
		this.bin.Add(
			Dependency<ProtectedFriendsController>().onFetchFriends.Connect(() => {
				this.UpdateList();
			}),
		);

		if (Game.IsPortrait()) {
			this.subtitle.text =
				"Parties let you play together with friends. Members auto follow the leader into games.";
		}
	}

	private UpdateList(): void {
		this.content.gameObject.ClearChildren();
		const statuses = Dependency<ProtectedFriendsController>().friendStatuses;
		let onlineCount = 0;
		for (let status of statuses) {
			if (status.status === GameCoordinatorUserStatus.UserStatus.OFFLINE) continue;
			let comp: PartyInviteModalFriend;
			if (!this.uidToOnlineFriend.has(status.userId)) {
				comp = Instantiate(this.playerPrefab, this.content).GetAirshipComponent<PartyInviteModalFriend>()!;
				this.uidToOnlineFriend.set(status.userId, comp);
				comp.Init(status.userId, status.username, status.status, status.profileImageId);
				onlineCount++;
			}
		}

		this.noOnlineFriends.SetActive(onlineCount <= 0);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
