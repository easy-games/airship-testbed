import { FriendsController } from "@Easy/Core/Client/ProtectedControllers//Social/FriendsController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import IncomingFriendRequestCard from "./IncomingFriendRequestCard";

export default class FriendRequestModal extends AirshipBehaviour {
	public content!: Transform;
	public friendRequestPrefab!: GameObject;
	private bin = new Bin();

	override Start(): void {
		this.AddCards();
		this.bin.Add(
			Dependency<FriendsController>().onIncomingFriendRequestsChanged.Connect(() => {
				this.AddCards();
			}),
		);
	}

	private AddCards(): void {
		this.content.gameObject.ClearChildren();

		const friendsController = Dependency<FriendsController>();
		for (const user of friendsController.incomingFriendRequests) {
			const go = Object.Instantiate(this.friendRequestPrefab, this.content);
			const card = go.GetAirshipComponent<IncomingFriendRequestCard>()!;
			card.Init(user);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
