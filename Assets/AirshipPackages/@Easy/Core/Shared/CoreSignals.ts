import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { UserStatus } from "./Airship/Types/Outputs/AirshipUser";

export const CoreSignals = {
	CoreInitialized: new Signal<{ idToken: string }>(),
	UserServiceInitialized: new Signal<{}>(),
	GameCoordinatorMessage: new Signal<{ messageName: string; jsonMessage: string }>(),

	StatusUpdateRequested: new Signal<{}>(),

	FriendRequested: new Signal<{ initiatorId: string }>(),
	FriendAccepted: new Signal<{ targetId: string }>(),
	FriendUserStatusChanged: new Signal<{ friendUid: string; status: UserStatus; gameName: string | undefined }>(),

	PartyInviteReceived: new Signal<{}>(),
	PartyUpdated: new Signal<{}>(),
};
