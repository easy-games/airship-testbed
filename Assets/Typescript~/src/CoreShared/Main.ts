import { ApiHelper } from "./ApiHelper";
import { CoreSignals } from "./CoreSignals";
import { EasyCore } from "./EasyCore";
import { encode } from "./Lib/json";
import { UserService } from "./Services/UserService";
import { PublicUser } from "./SocketIOMessages/PublicUser";

print(`CoreShared.Main.ts()`);

CoreSignals.Initialized.Connect((idToken) => {
	print(`Main.ts CoreSignals.Initialized!`);

	// EasyCore.getAsync<PublicUser>(`${ApiHelper.USER_SERVICE_URL}/users/self`, undefined, EasyCore.getHeadersMap()).then(
	// 	(publicUser) => {
	// 		print(`Main.ts publicUser: ${encode(publicUser)}`);

	// 		// const publicUser2 = UserService.getPublicUserAsync(publicUser.discriminatedUsername);

	// 		// print(`Main.ts publicUser2: ${encode(publicUser2)}`);
	// 	},
	// );
});

EasyCore.init();
