import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class PartyAddFriendButton extends AirshipBehaviour {
	public userId!: string;

	override Start(): void {
		CanvasAPI.OnPointerEvent(this.gameObject, (dir, button) => {
			print("Send friend request to " + this.userId);
		});
	}
}
