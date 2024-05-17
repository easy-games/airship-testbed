import { Platform } from "@Easy/Core/Shared/Airship";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { PublicUser } from "@Easy/Core/Shared/SocketIOMessages/PublicUser";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

@Controller({})
export class UserController implements OnStart {
	constructor() {
		if (Game.IsClient()) Platform.client.user = this;
	}

	OnStart(): void {}

	/**
	 * Gets a single user by their username.
	 * @param username The username of the user.
	 * @returns A user object
	 */
	public async GetUserByUsername(username: string): Promise<Result<PublicUser | undefined, undefined>> {
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
	}

	/**
	 * Gets a single user by their ID.
	 * @param userId The users ID
	 * @returns A user object
	 */
	public async GetUserById(userId: string): Promise<Result<PublicUser | undefined, undefined>> {
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
	}
}
