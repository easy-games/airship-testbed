import { Signal } from "Shared/Util/Signal";
import { UserStatus } from "./SocketIOMessages/Status";

export const CoreSignals = {
	CoreInitialized: new Signal<{ idToken: string }>(),
	UserServiceInitialized: new Signal(),
	GameCoordinatorMessage: new Signal<{ messageName: string; jsonMessage: string }>(),

	FriendUserStatusChanged: new Signal<{ friendUid: string; status: UserStatus }>(),
};
