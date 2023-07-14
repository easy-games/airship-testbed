import { ApiHelper } from "CoreShared/ApiHelper";
import { CoreSignals } from "CoreShared/CoreSignals";
import { EasyCore } from "CoreShared/EasyCore";
import { PublicUser } from "CoreShared/SocketIOMessages/PublicUser";

export class UserService {
	private static currentUser: PublicUser | undefined;

	static async initAsync() {
		this.currentUser = await EasyCore.getAsync<PublicUser>(
			`${ApiHelper.USER_SERVICE_URL}/users/self`,
			undefined,
			EasyCore.getHeadersMap(),
		);

		CoreSignals.UserServiceInitialized.Fire({});
	}

	static getCurrentPublicUser(): PublicUser | undefined {
		return this.currentUser;
	}

	static async getPublicUserAsync(discrimiatedUserName: string): Promise<PublicUser | undefined> {
		const params = new Map<string, string>();
		params.set("discriminatedUsername", discrimiatedUserName);

		const authHeaders = EasyCore.getHeadersMap();

		return undefined;

		try {
			return EasyCore.getAsync(`${ApiHelper.USER_SERVICE_URL}/users/user`, params, authHeaders);
		} catch (e) {
			print(`Unable to get PublicUser from discrimiatedUserName: ${discrimiatedUserName}`);
			return undefined;
		}
	}
}
