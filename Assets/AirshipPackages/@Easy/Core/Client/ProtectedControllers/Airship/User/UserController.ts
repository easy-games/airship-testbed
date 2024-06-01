import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export enum UserControllerBridgeTopics {
	GetUserByUsername = "UserController:GetUserByUsername",
	GetUserById = "UserController:GetUserById",
	GetUsersById = "UserController:GetUsersById",
	GetFriends = "UserController:GetFriends",
	IsFriendsWith = "UserController:IsFriendsWith",
}

export type BridgeApiGetUserByUsername = (username: string) => Result<PublicUser | undefined, undefined>;
export type BridgeApiGetUserById = (userId: string) => Result<PublicUser | undefined, undefined>;
export type BridgeApiGetUsersById = (
	userIds: string[],
	strict?: boolean,
) => Result<{ map: Record<string, PublicUser>; array: PublicUser[] }, undefined>;
export type BridgeApiGetFriends = () => Result<PublicUser[], undefined>;
export type BrigdeApiIsFriendsWith = (userId: string) => Result<boolean, undefined>;

@Controller({})
export class UserController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<BridgeApiGetUserByUsername>(
			UserControllerBridgeTopics.GetUserByUsername,
			(_, username) => {
				const res = InternalHttpManager.GetAsync(
					`${AirshipUrl.GameCoordinator}/users/user?discriminatedUsername=${username}`,
				);

				if (!res.success || res.statusCode > 299) {
					warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.data);
					return {
						success: false,
						data: undefined,
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
			},
		);

		contextbridge.callback<BridgeApiGetUserById>(UserControllerBridgeTopics.GetUserById, (_, userId) => {
			const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/users/uid/${userId}`);

			if (!res.success || res.statusCode > 299) {
				warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.data);
				return {
					success: false,
					data: undefined,
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
		});

		contextbridge.callback<BridgeApiGetUsersById>(
			UserControllerBridgeTopics.GetUsersById,
			(_, userIds, strict = true) => {
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
					warn(`Unable to get user. Status Code:  ${res.statusCode}.\n`, res.data);
					return {
						success: false,
						data: undefined,
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
			},
		);

		contextbridge.callback<BridgeApiGetFriends>(UserControllerBridgeTopics.GetFriends, (_) => {
			const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/self`);

			if (!res.success || res.statusCode > 299) {
				warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.data);
				return {
					success: false,
					data: undefined,
				};
			}

			return {
				success: true,
				data: DecodeJSON(res.data) as PublicUser[],
			};
		});

		contextbridge.callback<BrigdeApiIsFriendsWith>(UserControllerBridgeTopics.IsFriendsWith, (_, userId) => {
			const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/friends/uid/${userId}/status`);

			if (!res.success || res.statusCode > 299) {
				warn(`Unable to get friends. Status Code ${res.statusCode}.\n`, res.data);
				return {
					success: false,
					data: undefined,
				};
			}

			const data = DecodeJSON(res.data) as { areFriends: boolean };

			return {
				success: true,
				data: data.areFriends,
			};
		});
	}

	OnStart(): void {}
}
