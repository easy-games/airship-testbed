import {
	BridgeApiGetFriends,
	BridgeApiGetUserById,
	BridgeApiGetUserByUsername,
	BridgeApiGetUsersById,
	BrigdeApiIsFriendsWith,
	UserControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/User/UserController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { PublicUser } from "@Easy/Core/Shared/SocketIOMessages/PublicUser";
import { Result } from "@Easy/Core/Shared/Types/Result";

@Controller({})
export class UserController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.client.user = this;
	}

	OnStart(): void {}

	/**
	 * Gets a single user by their username.
	 * @param username The username of the user.
	 * @returns A user object
	 */
	public async GetUserByUsername(username: string): Promise<Result<PublicUser | undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetUserByUsername>(
			UserControllerBridgeTopics.GetUserByUsername,
			username,
		);
	}

	/**
	 * Gets a single user by their ID.
	 * @param userId The users ID
	 * @returns A user object
	 */
	public async GetUserById(userId: string): Promise<Result<PublicUser | undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetUserById>(
			UserControllerBridgeTopics.GetUserById,
			userId,
		);
	}

	/**
	 * Gets multiple users at once. This function will not succeed if it is unable to
	 * resolve all provided ids into a user.
	 * @param userIds The userIds to get.
	 * @param strict Specifies if all users must be found. If set to false, the function will
	 * succeed even if not all userIds resolve to a user.
	 * @returns An array of user objects.
	 */
	public async GetUsersById(
		userIds: string[],
		strict = true,
	): Promise<Result<{ map: Record<string, PublicUser>; array: PublicUser[] }, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetUsersById>(
			UserControllerBridgeTopics.GetUsersById,
			userIds,
			strict,
		);
	}

	/**
	 * Gets the users friends list.
	 * @returns A list of friends.
	 */
	public async GetFriends(): Promise<Result<PublicUser[], undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetFriends>(UserControllerBridgeTopics.GetFriends);
	}

	/**
	 * Checks if the user is friends with the user provided.
	 * @param userId The user id to check friend status with.
	 * @returns True if friends, false otherwise.
	 */
	public async IsFriendsWith(userId: string): Promise<Result<boolean, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BrigdeApiIsFriendsWith>(
			UserControllerBridgeTopics.IsFriendsWith,
			userId,
		);
	}
}
