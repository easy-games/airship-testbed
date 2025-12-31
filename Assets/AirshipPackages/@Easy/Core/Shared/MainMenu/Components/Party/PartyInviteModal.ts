import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import PartyInviteModalFriend from "./PartyInviteModalFriend";

export default class PartyInviteModal extends AirshipBehaviour {
	public content: RectTransform;
	public playerPrefab: GameObject;

	private bin = new Bin();
	private uidToOnlineFriend = new Map<string, PartyInviteModalFriend>();

	override Start(): void {
		this.UpdateList();
		this.bin.Add(
			Dependency<ProtectedFriendsController>().onFetchFriends.Connect(() => {
				this.UpdateList();
			}),
		);
	}

	private UpdateList(): void {
		this.content.gameObject.ClearChildren();
		const statuses = Dependency<ProtectedFriendsController>().friendStatuses;
		for (let status of statuses) {
			let comp: PartyInviteModalFriend;
			if (!this.uidToOnlineFriend.has(status.userId)) {
				comp = Instantiate(this.playerPrefab, this.content).GetAirshipComponent<PartyInviteModalFriend>()!;
				this.uidToOnlineFriend.set(status.userId, comp);
				comp.Init(status.userId, status.username);
			}
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
