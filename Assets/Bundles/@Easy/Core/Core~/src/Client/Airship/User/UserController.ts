import { Controller, OnStart } from "@easy-games/flamework-core";
import { PublicUser } from "Shared/SocketIOMessages/PublicUser";
import { Result } from "Shared/Types/Result";
import { DecodeJSON } from "Shared/json";

/**
 * Provides access to user information.
 */
@Controller({})
export class UserController implements OnStart {
	OnStart(): void {}

	/**
	 * Gets a users data by their username.
	 * @param username The username of the user
	 */
	public async GetUser(username: string): Promise<Result<PublicUser | undefined, undefined>> {
		const res = await UsersControllerBackend.GetUser(username);

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
}
