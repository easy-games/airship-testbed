import { ApiHelper } from "CoreShared/ApiHelper";
import { CoreSignals } from "CoreShared/CoreSignals";
import { EasyCore } from "CoreShared/EasyCore";
import { PublicUser } from "CoreShared/SocketIOMessages/PublicUser";
import { UpdateUserDto } from "CoreShared/SocketIOMessages/UpdateUserDto";
import { encode } from "Server/Lib/json";

export class UserAPI {
	private static currentUser: PublicUser | undefined;

	static async InitAsync() {
		this.currentUser = await EasyCore.GetAsync<PublicUser>(
			`${ApiHelper.USER_SERVICE_URL}/users/self`,
			undefined,
			EasyCore.GetHeadersMap(),
		);

		CoreSignals.UserServiceInitialized.Fire({});
	}

	static GetCurrentUser(): PublicUser | undefined {
		return this.currentUser;
	}

	static async GetUserAsync(discriminatedUserName: string): Promise<PublicUser | undefined> {
		const params = new Map<string, string>();
		params.set("discriminatedUsername", discriminatedUserName);

		const headers = EasyCore.GetHeadersMap();

		try {
			return EasyCore.GetAsync(`${ApiHelper.USER_SERVICE_URL}/users/user`, params, headers);
		} catch (e) {
			print(`Unable to get PublicUser from discriminatedUsername: ${discriminatedUserName}. error: ${e}`);
			return undefined;
		}
	}

	static async UpdateCurrentUserAsync(updateUserDto: UpdateUserDto) {
		const headers = EasyCore.GetHeadersMap();

		try {
			return EasyCore.PatchAsync(
				`${ApiHelper.USER_SERVICE_URL}/users`,
				encode(updateUserDto),
				undefined,
				headers,
			);
		} catch (e) {
			print(`Unable to updateCurrentUserAsync. updateUserDto: ${encode(updateUserDto)}. error: ${e}`);
			return undefined;
		}
	}
}
