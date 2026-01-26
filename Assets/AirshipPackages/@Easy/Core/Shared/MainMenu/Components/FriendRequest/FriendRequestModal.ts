import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers//Social/FriendsController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import IncomingFriendRequestCard from "./IncomingFriendRequestCard";

export default class FriendRequestModal extends AirshipBehaviour {
	public content!: Transform;
	public friendRequestPrefab!: GameObject;
	public contentLayoutElement: LayoutElement;
	public scrollRect: ScrollRect;
	private bin = new Bin();

	override Start(): void {
		this.AddCards();
		this.bin.Add(
			Dependency<ProtectedFriendsController>().onIncomingFriendRequestsChanged.Connect(() => {
				this.AddCards();
			}),
		);

		if (Game.deviceType === AirshipDeviceType.Phone && Game.IsLandscape()) {
			this.contentLayoutElement.minHeight = 0;
		}
	}

	private AddCards(): void {
		this.content.gameObject.ClearChildren();

		const friendsController = Dependency<ProtectedFriendsController>();
		for (const user of friendsController.incomingFriendRequests) {
			const go = Object.Instantiate(this.friendRequestPrefab, this.content);
			const card = go.GetAirshipComponent<IncomingFriendRequestCard>()!;
			card.Init(user, this.scrollRect);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
