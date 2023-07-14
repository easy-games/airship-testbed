import { CoreSignals } from "./CoreSignals";
import { EasyCore } from "./EasyCore";
import { UserService } from "./Services/UserService";

print(`CoreShared.Main.ts()`);

CoreSignals.CoreInitialized.Connect((signal) => {
	print(`Main.ts CoreSignals.CoreInitialized! signal.idToken: ${signal.idToken}`);

	UserService.initAsync();
});

CoreSignals.UserServiceInitialized.Connect(() => {
	const curUser = UserService.getCurrentPublicUser();

	print(`Main.ts CoreSignals.UserServiceInitialized! curUser?.username: ${curUser?.username}`);
});

CoreSignals.GameCoordinatorMessage.Connect((signal) => {
	print(
		`Main.ts CoreSignals.GameCoordinatorMessage! signal.messageName: ${signal.messageName}, signal.jsonMessage: ${signal.jsonMessage}`,
	);
});

if (RunCore.IsClient()) {
	EasyCore.initAsync();
}
