import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ProtectedSettingsSingleton } from "../Settings/ProtectedSettingsSingleton";

const enum PushNotificationPermission {
	NotDetermined = 0,
	Authorized = 1,
	Denied = 2,
}

interface PushNotificationManager {
	RegisterForPushNotificationAsync(): void;
	GetPushNotificationPermission(): PushNotificationPermission;
}
declare const PushNotificationManager: PushNotificationManager;

export default class ProtectedPushNotificationManager extends AirshipBehaviour {
	override Start(): void {
		if (Game.IsEditor()) return;
		if (!Game.playerFlags.has("PushNotifications")) return;

		if (Game.coreContext === CoreContext.MAIN_MENU && Game.IsMobile()) {
			const perm = PushNotificationManager.GetPushNotificationPermission();
			if (perm === PushNotificationPermission.Authorized) {
				PushNotificationManager.RegisterForPushNotificationAsync();
			} else if (perm === PushNotificationPermission.NotDetermined) {
				const settings = Dependency<ProtectedSettingsSingleton>();
				// Only prompt once per day
				if (
					os.time() - settings.data.lastPushNotifPromptTime > 60 * 60 * 24 &&
					os.time() - settings.data.firstLoginTime > 60 * 60 * 24
				) {
					settings.data.lastPushNotifPromptTime = os.time();
					settings.MarkAsDirty();
					const res = NativeAlertManager.ShowAsync(
						"Turn on Push Notifications to never miss a playtest.",
						"Airship notifies you when exclusive events are live.",
						"Allow",
						"Don't Allow",
					);
					if (res) {
						PushNotificationManager.RegisterForPushNotificationAsync();
					}
				}
			}
		}
	}

	override OnDestroy(): void {}
}
