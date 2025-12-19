import { AuthController } from "@Easy/Core/Client/ProtectedControllers/Auth/AuthController";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import GearUnlockUI from "./GearUnlockUI";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

interface GearUnlockNotificationData {
	classId: string;
	messageTitle: string;
	messageBody: string;
}

export default class GearUnlockManager extends AirshipBehaviour {
	public container: GameObject;
	public ui: GearUnlockUI;

	override Start(): void {
		this.container.SetActive(false);

		if (Game.coreContext !== CoreContext.MAIN_MENU) {
			return;
		}

		if (Game.IsEditor()) {
			Keyboard.OnKeyDown(Key.P, (e) => {
				if (e.IsCancelled()) return;

				this.ShowRewardYielding("test", {
					classId: "39c9c35b-d849-448b-8554-e919f3e26e01",
					messageTitle: "Unlocked: BETA Chain",
					messageBody:
						"Thank you for playing the Airship Beta. As a thank you, you've unlocked an exclusive avatar item.",
				});
			});
		}

		task.spawn(() => {
			Dependency<AuthController>().WaitForAuthed();
			this.CheckNotifications();
		});
	}

	public async CheckNotifications(): Promise<void> {
		const { notifications } = await client.userNotifications.getNotifications();
		for (let notif of notifications) {
			if (notif.type === "GEAR_UNLOCK_POPUP") {
				const data = notif.data as GearUnlockNotificationData;
				this.ShowRewardYielding(notif.id, data);
			}
		}
	}

	public ShowRewardYielding(notificationId: string, data: GearUnlockNotificationData): void {
		if (!Game.playerFlags.has("PlatformGearDownloadClassId")) {
			warn("Missing flags for platform gear download.");
			return;
		}

		print("Downloading reward gear...");
		const gear = PlatformGear.DownloadYielding(data.classId);
		if (!gear) {
			warn("Downloaded gear unlock was undefined");
			return;
		}

		print("Downloaded! Showing now...");
		this.container.SetActive(false);
		this.ui.Init(notificationId);
		this.container.SetActive(true);
		this.ui.SetGear(gear, data.messageTitle, data.messageBody);
	}

	override OnDestroy(): void {}
}
