import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { PublicUser } from "@Easy/Core/Shared/SocketIOMessages/PublicUser";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export enum UserServiceBridgeTopics {
	GetUserByUsername = "UserService:GetUserByUsername",
	GetUserById = "UserService:GetUserById",
	GetUsersById = "UserService:GetUsersById",
}

export type ServerBridgeApiGetUserByUsername = (username: string) => Result<PublicUser | undefined, undefined>;
export type ServerBridgeApiGetUserById = (userId: string) => Result<PublicUser | undefined, undefined>;
export type ServerBridgeApiGetUsersById = (
	userIds: string[],
	strict?: boolean,
) => Result<{ map: Record<string, PublicUser>; array: PublicUser[] }, undefined>;

@Service({})
export class UserService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGetUserByUsername>(
			UserServiceBridgeTopics.GetUserByUsername,
			(_, username) => {
				const res = InternalHttpManager.GetAsync(
					`${AirshipUrl.GameCoordinator}/users/user?descriminatedUsername=${username}`,
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

		contextbridge.callback<ServerBridgeApiGetUserById>(UserServiceBridgeTopics.GetUserById, (_, userId) => {
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

		contextbridge.callback<ServerBridgeApiGetUsersById>(
			UserServiceBridgeTopics.GetUsersById,
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
					`${AirshipUrl.GameCoordinator}/users?users[]=${userIds.join("&users[]=")}&strict=${strict ? "true" : "false"}`,
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
	}

	OnStart(): void {}
}
