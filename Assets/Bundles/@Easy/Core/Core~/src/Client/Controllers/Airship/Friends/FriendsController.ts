import {
	BridgeApiGetFriends,
	BrigdeApiIsFriendsWith,
	FriendsControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/Friends/FriendsController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { PublicUser } from "@Easy/Core/Shared/SocketIOMessages/PublicUser";
import { Result } from "@Easy/Core/Shared/Types/Result";

@Controller({})
export class FriendsController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.client.friends = this;
	}

	OnStart(): void {}

	/**
	 * Gets the users friends list.
	 * @returns A list of friends.
	 */
	public async GetFriends(): Promise<Result<PublicUser[], undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetFriends>(FriendsControllerBridgeTopics.GetFriends);
	}

	/**
	 * Checks if the user is friends with the user provided.
	 * @param userId The user id to check friend status with.
	 * @returns True if friends, false otherwise.
	 */
	public async IsFriendsWith(userId: string): Promise<Result<boolean, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BrigdeApiIsFriendsWith>(
			FriendsControllerBridgeTopics.IsFriendsWith,
			userId,
		);
	}
}
