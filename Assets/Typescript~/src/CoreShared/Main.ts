import { ApiHelper } from "./ApiHelper";
import { CoreSignals } from "./CoreSignals";
import { EasyCore } from "./EasyCore";
import { encode } from "./Lib/json";
import { UserService } from "./Services/UserService";
import { PublicUser } from "./SocketIOMessages/PublicUser";

print(`CoreShared.Main.ts()`);

CoreSignals.CoreInitialized.Connect((signal) => {
	print(`Main.ts CoreSignals.CoreInitialized! signal.idToken: ${signal.idToken}`);

	UserService.initAsync();
});

CoreSignals.UserServiceInitialized.Connect(() => {
	const curUser = UserService.getCurrentPublicUser();

	print(`Main.ts CoreSignals.UserServiceInitialized! curUser?.username: ${curUser?.username}`);
});

EasyCore.initAsync();
