import { Service, OnStart } from "@easy-games/flamework-core";
import { PublicUser } from "Shared/SocketIOMessages/PublicUser";
import { Result } from "Shared/Types/Result";
import { DecodeJSON } from "Shared/json";

/**
 * Provides access to user information.
 */
@Service({})
export class UserService implements OnStart {
	OnStart(): void {}

	public async GetUserByUsername(username: string): Promise<Result<PublicUser | undefined, undefined>> {
		const res = await UsersServiceBackend.GetUserByUsername(username);

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

	public async GetUserById(userId: string): Promise<Result<PublicUser | undefined, undefined>> {
		const res = await UsersServiceBackend.GetUserById(userId);

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
		strict: "true" | "false" = "true",
	): Promise<Result<PublicUser[], undefined>> {
		if (userIds.size() === 0) {
			return {
				success: true,
				data: [],
			};
		}

		const res = await UsersServiceBackend.GetUsersById(`users[]=${userIds.join("&users[]=")}&strict=${strict}`);

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
				data: [],
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as PublicUser[],
		};
	}
}
