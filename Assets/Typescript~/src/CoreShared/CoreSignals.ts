import { Signal } from "Shared/Util/Signal";

export const CoreSignals = {
	CoreInitialized: new Signal<{ idToken: string }>(),
	UserServiceInitialized: new Signal(),
	GameCoordinatorMessage: new Signal<{ messageName: string; jsonMessage: string }>(),
};
