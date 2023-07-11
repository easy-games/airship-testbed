import { ApiHelper } from "./ApiHelper";
import { EasyCore } from "./EasyCore";
import { encode } from "./Lib/json";
import { UserService } from "./Services/UserService";
import { PublicUser } from "./SocketIOMessages/PublicUser";

print(`CoreShared.Main.ts()`);

const easyCore = new EasyCore();

easyCore.getHeadersMapAsync().then(async (headers) => {
	//print(`Main.ts 1 headers: ${encode(headers)}`);

	// const publicUser = await easyCore.getAsync<PublicUser>(
	// 	`${ApiHelper.USER_SERVICE_URL}/users/self`,
	// 	undefined,
	// 	headers,
	// );

	// print(`Main.ts publicUser: ${encode(publicUser)}`);

	const userService = new UserService();

	// const publicUser2 = await userService.getPublicUser(publicUser.discriminatedUsername);

	// print(`Main.ts publicUser2: ${encode(publicUser2)}`);
});
