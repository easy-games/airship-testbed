import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import FriendCard from "@Easy/Core/Shared/MainMenu/Components/Friends/FriendCard";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class PartyCard extends AirshipBehaviour {
	public dropFriendHover!: GameObject;
	public defaultContents!: GameObject;

	override Start(): void {
		// If hovering with a friend card
		CanvasAPI.OnHoverEvent(this.gameObject, (hoverState, data) => {
			// Check if dragging a friend card
			const friendCard = data.pointerDrag?.GetAirshipComponent<FriendCard>();

			const hovering = hoverState === HoverState.ENTER && friendCard !== undefined;
			this.SetFriendHoverState(hovering);
		});

		// Watch for dropping friends on party card
		CanvasAPI.OnDropEvent(this.gameObject, (data) => {
			this.SetFriendHoverState(false);

			const draggedObject = data.pointerDrag;
			const friendId = draggedObject.GetAirshipComponent<FriendCard>()?.friendId;
			if (friendId) {
				Dependency<ProtectedPartyController>().InviteToParty(friendId);
			}
		});
	}

	private SetFriendHoverState(hovering: boolean) {
		this.dropFriendHover.SetActive(hovering === true);
		// this.defaultContents.SetActive(hovering === false);
	}
}
