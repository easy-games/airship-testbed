import {
	BridgeApiGetFriends,
	BridgeApiGetUserById,
	BridgeApiGetUserByUsername,
	BridgeApiGetUsersById,
	BrigdeApiIsFriendsWith,
	ProtectedUserController,
	UserControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/User/UserController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

/**
 * Provides access to user information.
 */
@Controller({})
export class AirshipUserController {
	// Local cache of username (lowercase) -> user id
	private usernameToUidCache = new Map<string, string>();
	// Local cache of user id -> public user (if they exist)
	private userCache = new Map<string, { user?: PublicUser }>();

	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.User = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets a single user by their username (case insensitive).
	 * @param username The username of the user.
	 * @param useLocalCache If true this function will return values cached locally. This is usually preferable
	 * unless you need to guarantee the most up-to-date results. Defaults to ``true``.
	 * @returns A result with a user object. If success is true but data is undefined that means the request succeeded
	 * but no user exists with the given id.
	 */
	public async GetUserByUsername(username: string, useLocalCache = true): Promise<Result<PublicUser | undefined, undefined>> {
		// First check local cache for user
		if (useLocalCache) {
			const uid = this.usernameToUidCache.get(username.lower());
			if (uid) {
				// Local cache says no user exists with this username
				if (uid.size() === 0) return { success: true, data: undefined };

				const user = this.userCache.get(uid);
				if (user) return { success: true, data: user.user };
			} 
		}

		let result: Result<PublicUser | undefined, undefined>;
		if (contextbridge.current() !== LuauContext.Protected) {
			result = await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetUserByUsername>(
				UserControllerBridgeTopics.GetUserByUsername,
				LuauContext.Protected,
				username,
			);
		} else {
			result = Dependency<ProtectedUserController>().GetUserByUsername(username);
		}
		
		if (result.success) {
			if (result.data) {
				this.AddUserToCache(result.data.uid, result.data);
			} else {
				this.usernameToUidCache.set(username, "");
			}
		}
		return result;
	}

	/**
	 * Gets a single user by their ID.
	 * @param userId The users ID
	 * @param useLocalCache If true this function will return values cached locally. This is usually preferable
	 * unless you need to guarantee the most up-to-date results. Defaults to ``true``.
	 * @returns A result with a user object. If success is true but data is undefined that means the request succeeded
	 * but no user exists with the given id.
	 */
	public async GetUserById(userId: string, useLocalCache = true): Promise<Result<PublicUser | undefined, undefined>> {
		// First check local cache for user
		if (useLocalCache) {
			const existing = this.userCache.get(userId);
			if (existing) return { success: true, data: existing.user };
		}

		let result: Result<PublicUser | undefined, undefined>;
		if (contextbridge.current() !== LuauContext.Protected) {
			result = await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetUserById>(
				UserControllerBridgeTopics.GetUserById,
				LuauContext.Protected,
				userId,
			);
		} else {
			result = Dependency<ProtectedUserController>().GetUserById(userId);
		}
		if (result.success) {
			this.AddUserToCache(userId, result.data);
		}
		return result;
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
			LuauContext.Protected,
			userIds,
			strict,
		);
	}

	/**
	 * Gets the users friends list.
	 * @returns A list of friends.
	 */
	public async GetFriends(): Promise<Result<PublicUser[], undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetFriends>(UserControllerBridgeTopics.GetFriends, LuauContext.Protected);
	}

	/**
	 * Checks if the user is friends with the user provided.
	 * @param userId The user id to check friend status with.
	 * @returns True if friends, false otherwise.
	 */
	public async IsFriendsWith(userId: string): Promise<Result<boolean, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BrigdeApiIsFriendsWith>(
			UserControllerBridgeTopics.IsFriendsWith,
			LuauContext.Protected,
			userId,
		);
	}

	private AddUserToCache(userId: string, user?: PublicUser) {
		if (user) {
			this.usernameToUidCache.set(user.username.lower(), user.uid);
		}
		this.userCache.set(userId, { user: user });
	}
}
