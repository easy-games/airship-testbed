import { ApiHelper } from "CoreShared/ApiHelper";
import { EasyCore } from "CoreShared/EasyCore";
import { PublicUser } from "CoreShared/SocketIOMessages/PublicUser";

export class UserService {
	private easyCore: EasyCore = new EasyCore();

	async getPublicUser(discrimiatedUserName: string): Promise<PublicUser | undefined> {
		const params = new Map<string, string>();
		params.set("discriminatedUsername", discrimiatedUserName);

		const authHeaders = await this.easyCore.getHeadersMapAsync();

		return undefined;

		try {
			return this.easyCore.getAsync(`${ApiHelper.USER_SERVICE_URL}/users/user`, params, authHeaders);
		} catch (e) {
			print(`Unable to get PublicUser from discrimiatedUserName: ${discrimiatedUserName}`);
			return undefined;
		}
	}
}
