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
import { AirshipUser } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * Provides access to user information.
 */
@Controller({})
export class AirshipUserController {
	// Local cache of username (lowercase) -> user id
	private usernameToUidCache = new Map<string, string>();
	// Local cache of user id -> public user (if they exist)
	private userCache = new Map<string, { user?: AirshipUser }>();

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
	public async GetUserByUsername(username: string, useLocalCache = true): Promise<AirshipUser | undefined> {
		// First check local cache for user
		if (useLocalCache) {
			const uid = this.usernameToUidCache.get(username.lower());
			if (uid) {
				// Local cache says no user exists with this username
				if (uid.size() === 0) return undefined;

				const user = this.userCache.get(uid);
				if (user) return user.user;
			}
		}

		let result: ReturnType<BridgeApiGetUserByUsername>;
		if (contextbridge.current() !== LuauContext.Protected) {
			result = contextbridge.invoke<BridgeApiGetUserByUsername>(
				UserControllerBridgeTopics.GetUserByUsername,
				LuauContext.Protected,
				username,
			);
		} else {
			result = await Dependency<ProtectedUserController>().GetUserByUsername(username);
		}

		if (result) {
			this.AddUserToCache(result.uid, result);
		} else {
			this.usernameToUidCache.set(username, "");
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
	public async GetUserById(userId: string, useLocalCache = true): Promise<AirshipUser | undefined> {
		// First check local cache for user
		if (useLocalCache) {
			const existing = this.userCache.get(userId);
			if (existing) return existing.user;
		}

		let result: ReturnType<BridgeApiGetUserById>;
		if (contextbridge.current() === LuauContext.Protected) {
			// print("[API Client_Protected]: GetUserById " + userId + " " + debug.traceback());
			result = await Dependency<ProtectedUserController>().GetUserById(userId);
		} else {
			// print("[API Client_Game]: GetUserById " + userId + " " + debug.traceback());
			result = contextbridge.invoke<BridgeApiGetUserById>(
				UserControllerBridgeTopics.GetUserById,
				LuauContext.Protected,
				userId,
			);
		}

		this.AddUserToCache(userId, result);
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
	): Promise<{
		map: Record<string, AirshipUser>;
		array: AirshipUser[];
	}> {
		return contextbridge.invoke<BridgeApiGetUsersById>(
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
	public async GetFriends(): Promise<AirshipUser[]> {
		return contextbridge.invoke<BridgeApiGetFriends>(UserControllerBridgeTopics.GetFriends, LuauContext.Protected);
	}

	/**
	 * Checks if the user is friends with the user provided.
	 * @param userId The user id to check friend status with.
	 * @returns True if friends, false otherwise.
	 */
	public async IsFriendsWith(userId: string): Promise<boolean> {
		return contextbridge.invoke<BrigdeApiIsFriendsWith>(
			UserControllerBridgeTopics.IsFriendsWith,
			LuauContext.Protected,
			userId,
		);
	}

	private AddUserToCache(userId: string, user?: AirshipUser) {
		if (user) {
			this.usernameToUidCache.set(user.username.lower(), user.uid);
		}
		this.userCache.set(userId, { user: user });
	}
}
