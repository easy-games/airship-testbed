import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { AuthController } from "../../Auth/AuthController";
import { ProtectedFriendsController } from "../../Social/FriendsController";
import { User } from "../../User/User";

export const enum UserControllerBridgeTopics {
	GetUserByUsername = "UserController:GetUserByUsername",
	GetUserById = "UserController:GetUserById",
	GetUsersById = "UserController:GetUsersById",
	GetFriends = "UserController:GetFriends",
	IsFriendsWith = "UserController:IsFriendsWith",
}

export type BridgeApiGetUserByUsername = (username: string) => Result<PublicUser | undefined, string>;
export type BridgeApiGetUserById = (userId: string) => Result<PublicUser | undefined, string>;
export type BridgeApiGetUsersById = (
	userIds: string[],
	strict?: boolean,
) => Result<{ map: Record<string, PublicUser>; array: PublicUser[] }, string>;
export type BridgeApiGetFriends = () => Result<PublicUser[], string>;
export type BrigdeApiIsFriendsWith = (userId: string) => Result<boolean, string>;

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
				const [success, result] = this.GetUserByUsername(username).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<BridgeApiGetUserById>(UserControllerBridgeTopics.GetUserById, (_, userId) => {
			const [success, result] = this.GetUserById(userId).await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});

		contextbridge.callback<BridgeApiGetUsersById>(
			UserControllerBridgeTopics.GetUsersById,
			(_, userIds, strict = true) => {
				const [success, result] = this.GetUsersById(userIds, strict).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<BridgeApiGetFriends>(UserControllerBridgeTopics.GetFriends, (_) => {
			const [success, result] = this.GetFriends().await();
			if (!success) return { success: false, error: "Unable to complete request." };
			return result;
		});

		contextbridge.callback<BrigdeApiIsFriendsWith>(UserControllerBridgeTopics.IsFriendsWith, (_, userId) => {
			const [success, result] = this.IsFriendsWith(userId).await();
			if (!success) return { success: false, error: "Unable to complete request." };
			return result;
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
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/uid/${userId}/status`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		const data = DecodeJSON(res.data) as { areFriends: boolean };

		return {
			success: true,
			data: data.areFriends,
		};
	}

	/**
	 * Makes a request for user info.
	 *
	 * @internal
	 */
	public async GetUserById(userId: string): Promise<ReturnType<BridgeApiGetUserById>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/users/uid/${userId}`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		if (!res.data) {
			return {
				success: true,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as PublicUser,
		};
	}

	public async GetUserByUsername(username: string): Promise<ReturnType<BridgeApiGetUserByUsername>> {
		const res = InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/users/user?username=${username}`,
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		if (!res.data) {
			return {
				success: true,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as PublicUser,
		};
	}

	public async GetUsersById(userIds: string[], strict = true): Promise<ReturnType<BridgeApiGetUsersById>> {
		if (userIds.size() === 0) {
			return {
				success: true,
				data: {
					map: {},
					array: [],
				},
			};
		}

		const res = InternalHttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/users?users[]=${userIds.join("&users[]=")}&strict=${
				strict ? "true" : "false"
			}`,
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		if (!res.data) {
			return {
				success: true,
				data: {
					map: {},
					array: [],
				},
			};
		}

		const array = DecodeJSON(res.data) as PublicUser[];
		const map: Record<string, PublicUser> = {};
		array.forEach((u) => (map[u.uid] = u));

		return {
			success: true,
			data: {
				map,
				array,
			},
		};
	}

	public async GetFriends(): Promise<ReturnType<BridgeApiGetFriends>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/self`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as PublicUser[],
		};
	}

	protected OnStart(): void {
		this.authController.onAuthenticated.Connect(() => {
			task.spawn(() => {
				this.FetchLocalUser();
			});
		});

		this.authController.onSignOut.Connect(() => {
			this.localUser = undefined;
		});
	}

	public FetchLocalUser(): void {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/users/self`);
		let success = false;
		if (res.success) {
			if (res.data.size() === 0 || res.data === "") {
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
				const data = DecodeJSON(res.data) as User;
				this.localUser = data;
				this.localUserLoaded = true;

				if (Game.coreContext === CoreContext.MAIN_MENU || true) {
					const writeUser = Game.localPlayer as Player;
					writeUser.userId = data.uid;
					writeUser.username = data.username;
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
			task.delay(1, () => {
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
