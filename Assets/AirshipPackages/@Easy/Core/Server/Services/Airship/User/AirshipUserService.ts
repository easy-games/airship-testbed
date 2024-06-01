import {
	ServerBridgeApiGetUserById,
	ServerBridgeApiGetUserByUsername,
	ServerBridgeApiGetUsersById,
	UserServiceBridgeTopics,
} from "@Easy/Core/Server/ProtectedServices/Airship/User/UserService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

@Service({})
export class UserService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.server.user = this;
	}

	OnStart(): void {}

	/**
	 * Gets a single user by their username.
	 * @param username The username of the user.
	 * @returns A user object
	 */
	public async GetUserByUsername(username: string): Promise<Result<PublicUser | undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiGetUserByUsername>(
			UserServiceBridgeTopics.GetUserByUsername,
			username,
		);
	}

	/**
	 * Gets a single user by their ID.
	 * @param userId The users ID
	 * @returns A user object
	 */
	public async GetUserById(userId: string): Promise<Result<PublicUser | undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiGetUserById>(
			UserServiceBridgeTopics.GetUserById,
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
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiGetUsersById>(
			UserServiceBridgeTopics.GetUsersById,
			userIds,
			strict,
		);
	}
}
