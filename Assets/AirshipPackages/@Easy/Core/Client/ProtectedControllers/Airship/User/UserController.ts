import { AirshipUser } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Protected } from "@Easy/Core/Shared/Protected";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest, UnityMakeRequestError } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { AuthController } from "../../Auth/AuthController";
import { ProtectedFriendsController } from "../../Social/FriendsController";

export const enum UserControllerBridgeTopics {
	GetUserByUsername = "UserController:GetUserByUsername",
	GetUserById = "UserController:GetUserById",
	GetUsersById = "UserController:GetUsersById",
	GetFriends = "UserController:GetFriends",
	IsFriendsWith = "UserController:IsFriendsWith",
}

export type BridgeApiGetUserByUsername = (username: string) => AirshipUser | undefined;
export type BridgeApiGetUserById = (userId: string) => AirshipUser | undefined;
export type BridgeApiGetUsersById = (
	userIds: string[],
	strict?: boolean,
) => { map: Record<string, AirshipUser>; array: AirshipUser[] };
export type BridgeApiGetFriends = () => AirshipUser[];
export type BrigdeApiIsFriendsWith = (userId: string) => boolean;

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class ProtectedUserController {
	public localUser: AirshipUser | undefined;

	/** Users can be guests in editor */
	public isGuest = false;

	public onLocalUserUpdated = new Signal<AirshipUser>();
	/**
	 * Will fire with `user` being undefined if player is a guest.
	 *
	 * Users can be guests in editor.
	 */
	public onLocalUserOrGuestDetermined = new Signal<[user: AirshipUser | undefined]>();

	/** True when we know if the player is a guest or not. */
	public isGuestDetermined = false;

	private localUserLoaded = false;

	constructor(private readonly authController: AuthController) {
		Protected.User = this;

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
		const result = await client.friends.statusWithOtherUser({ uid: userId });
		return result.areFriends;
	}

	/**
	 * Makes a request for user info.
	 *
	 * @internal
	 */
	public async GetUserById(userId: string): Promise<ReturnType<BridgeApiGetUserById>> {
		try {
			const result = await client.users.getByUid({ params: { uid: userId } });
			return result.user;
		} catch (err) {
			if (UnityMakeRequestError.IsInstance(err) && err.status === 404) {
				return undefined;
			}
			throw err;
		}
	}

	public async GetUserByUsername(username: string): Promise<ReturnType<BridgeApiGetUserByUsername>> {
		const result = await client.users.findByUsername({ username });
		return result.user;
	}

	public async GetUsersById(userIds: string[], strict = true): Promise<ReturnType<BridgeApiGetUsersById>> {
		if (userIds.size() === 0) {
			return {
				map: {},
				array: [],
			};
		}

		const array = await client.users.find({ users: userIds, strict });
		const map: Record<string, AirshipUser> = {};
		array.forEach((u) => (map[u.uid] = u));

		return {
			map,
			array,
		};
	}

	public async GetFriends(): Promise<ReturnType<BridgeApiGetFriends>> {
		return await client.friends.getFriends();
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

	public MarkAsGuest(): void {
		this.isGuest = true;
		this.isGuestDetermined = true;
		this.onLocalUserOrGuestDetermined.Fire(undefined);
	}

	public async FetchLocalUser(): Promise<void> {
		try {
			const { user } = await client.users.login();
			if (!user) {
				let ignore = false;
				if (Game.coreContext === CoreContext.GAME && Game.IsEditor()) {
					ignore = true;
				}
				if (!ignore) {
					print("users/self did not contain user. routing to login screen.");
					Bridge.LoadScene("Login", true, LoadSceneMode.Single);
				}
				this.isGuest = true;
				this.isGuestDetermined = true;
				this.onLocalUserOrGuestDetermined.Fire(undefined);
				return;
			}

			this.localUser = user;
			this.localUserLoaded = true;
			this.isGuestDetermined = true;

			const writeUser = Game.localPlayer as Player;
			(writeUser.userId as string) = user.uid;
			(writeUser.username as string) = user.username;
			Game.localPlayerLoaded = true;
			Game.onLocalPlayerLoaded.Fire();

			this.onLocalUserUpdated.Fire(this.localUser);
			this.onLocalUserOrGuestDetermined.Fire(this.localUser);
		} catch {
			task.unscaledDelay(1, () => {
				this.FetchLocalUser();
			});
		}
	}

	public WaitForIsGuest(): boolean {
		while (!this.isGuestDetermined) {
			task.wait();
		}
		return this.isGuest;
	}

	public WaitForLocalUser(): AirshipUser {
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
