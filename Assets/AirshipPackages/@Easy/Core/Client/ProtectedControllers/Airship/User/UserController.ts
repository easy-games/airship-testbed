import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { AuthController } from "../../Auth/AuthController";
import { ProtectedFriendsController } from "../../Social/FriendsController";
import { User } from "../../User/User";
import { RetryHttp429 } from "@Easy/Core/Shared/Http/HttpRetry";

export const enum UserControllerBridgeTopics {
	GetUserByUsername = "UserController:GetUserByUsername",
	GetUserById = "UserController:GetUserById",
	GetUsersById = "UserController:GetUsersById",
	GetFriends = "UserController:GetFriends",
	IsFriendsWith = "UserController:IsFriendsWith",
}

export type BridgeApiGetUserByUsername = (username: string) => PublicUser | undefined;
export type BridgeApiGetUserById = (userId: string) => PublicUser | undefined;
export type BridgeApiGetUsersById = (
	userIds: string[],
	strict?: boolean,
) => { map: Record<string, PublicUser>; array: PublicUser[] };
export type BridgeApiGetFriends = () => PublicUser[];
export type BrigdeApiIsFriendsWith = (userId: string) => boolean;

@Controller({})
export class ProtectedUserController {
	public localUser: User | undefined;

	public onLocalUserUpdated = new Signal<User>();
	private localUserLoaded = false;

	constructor(private readonly authController: AuthController) {
		Protected.user = this;

		contextbridge.callback<BridgeApiGetUserByUsername>(
			UserControllerBridgeTopics.GetUserByUsername,
			(_, username) => {
				return this.GetUserByUsername(username).expect();
			},
		);

		contextbridge.callback<BridgeApiGetUserById>(UserControllerBridgeTopics.GetUserById, (_, userId) => {
			return this.GetUserById(userId).expect();
		});

		contextbridge.callback<BridgeApiGetUsersById>(
			UserControllerBridgeTopics.GetUsersById,
			(_, userIds, strict = true) => {
				return this.GetUsersById(userIds, strict).expect();
			},
		);

		contextbridge.callback<BridgeApiGetFriends>(UserControllerBridgeTopics.GetFriends, (_) => {
			return this.GetFriends().expect();
		});

		contextbridge.callback<BrigdeApiIsFriendsWith>(UserControllerBridgeTopics.IsFriendsWith, (_, userId) => {
			return this.IsFriendsWith(userId).expect();
		});
	}

	/**
	 * Fetch to see if friends with other userId
	 *
	 * Faster: {@link ProtectedFriendsController.IsFriendsWith}
	 *
	 * @internal
	 */
	public async IsFriendsWith(userId: string): Promise<ReturnType<BrigdeApiIsFriendsWith>> {
		const res = await RetryHttp429(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/uid/${userId}/status`),
			{ retryKey: "get/game-coordinator/friends/uid/:userId/status" }
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		const data = json.decode(res.data) as { areFriends: boolean };

		return data.areFriends;
	}

	/**
	 * Makes a request for user info.
	 *
	 * @internal
	 */
	public async GetUserById(userId: string): Promise<ReturnType<BridgeApiGetUserById>> {
		const res = await RetryHttp429(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/users/uid/${userId}`),
			{ retryKey: "get/game-coordinator/users/uid/:userId" }
		);

		if (res.statusCode === 404) {
			return undefined;
		}

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode<{ user: PublicUser | undefined }>(res.data).user;
	}

	public async GetUserByUsername(username: string): Promise<ReturnType<BridgeApiGetUserByUsername>> {
		const res = await RetryHttp429(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/users/user?username=${username}`),
			{ retryKey: "get/game-coordinator/users/user" }
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode<{ user: PublicUser | undefined }>(res.data).user;
	}

	public async GetUsersById(userIds: string[], strict = true): Promise<ReturnType<BridgeApiGetUsersById>> {
		if (userIds.size() === 0) {
			return {
				map: {},
				array: [],
			};
		}

		const res = await RetryHttp429(
			() => InternalHttpManager.GetAsync(
				`${AirshipUrl.GameCoordinator}/users?users[]=${userIds.join("&users[]=")}&strict=${
					strict ? "true" : "false"
				}`,
			),
			{ retryKey: "get/game-coordinator/users" }
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		if (!res.data) {
			return {
				map: {},
				array: [],
			};
		}

		const array = json.decode(res.data) as PublicUser[];
		const map: Record<string, PublicUser> = {};
		array.forEach((u) => (map[u.uid] = u));

		return {
			map,
			array,
		};
	}

	public async GetFriends(): Promise<ReturnType<BridgeApiGetFriends>> {
		const res = await RetryHttp429(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/self`),
			{ retryKey: "get/game-coordinator/friends/self" }
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode(res.data) as PublicUser[];
	}

	protected OnStart(): void {
		this.authController.onAuthenticated.Connect(() => {
			task.spawn(async () => {
				await this.FetchLocalUser();
			});
		});

		this.authController.onSignOut.Connect(() => {
			this.localUser = undefined;
		});
	}

	public async FetchLocalUser(): Promise<void> {
		const res = await RetryHttp429(
			() => InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/users/self`),
			{ retryKey: "get/game-coordinator/users/self" }
		);
		let success = false;
		if (res.success) {
			const { user } = json.decode<{ user: User | undefined }>(res.data);

			if (!user) {
				let ignore = false;
				if (Game.coreContext === CoreContext.GAME && Game.IsEditor()) {
					ignore = true;
				}
				if (!ignore) {
					Bridge.LoadScene("Login", true, LoadSceneMode.Single);
				}
				return;
			}
			try {
				this.localUser = user;
				this.localUserLoaded = true;

				if (Game.coreContext === CoreContext.MAIN_MENU || true) {
					const writeUser = Game.localPlayer as Player;
					writeUser.userId = user.uid;
					writeUser.username = user.username;
					Game.localPlayerLoaded = true;
					Game.onLocalPlayerLoaded.Fire();
				}

				success = true;
				this.onLocalUserUpdated.Fire(this.localUser);
			} catch (err) {
				Debug.LogError("Failed to decode /users/self: " + res.data + " error: " + err);
			}
		}

		// retry
		if (!success) {
			task.unscaledDelay(1, () => {
				this.FetchLocalUser();
			});
		}
	}

	public WaitForLocalUser(): User {
		while (!this.localUser) {
			task.wait();
		}
		return this.localUser;
	}

	public Logout() {
		AuthManager.ClearSavedAccount();
		Bridge.LoadScene("Login", true, LoadSceneMode.Single);
	}
}
