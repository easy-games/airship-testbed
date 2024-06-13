import { FriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { Dependency } from "../Flamework";
import { Game } from "../Game";

/**
 * A player object used within the Protected Context.
 */
export class ProtectedPlayer {
	constructor(public username: string, public userId: string, public profileImageId: string) {}

	/** Is player friends with the local player? */
	public IsFriend(): boolean {
		if (Game.IsClient()) {
			return Dependency<FriendsController>().friends.find((u) => u.uid === this.userId) !== undefined;
		}
		return false;
	}

	public IsLocalPlayer(): boolean {
		return Game.IsClient() && Game.localPlayer?.userId === this.userId;
	}
}
