import { Dependency } from "@Easy/Core/Shared/Flamework";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";
import { RetryHttp429 } from "@Easy/Core/Shared/Http/HttpRetry";

export default class DeleteAccountButton extends AirshipBehaviour {
	private bin = new Bin();

	override OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				task.spawn(async () => {
					const confirmed = await Dependency<MainMenuSingleton>().ShowConfirmModal(
						"Delete Account",
						"Are you sure you want to delete your account? This cannot be undone.",
					);
					if (!confirmed) return;
					const res = await RetryHttp429(
						() => InternalHttpManager.DeleteAsync(AirshipUrl.GameCoordinator + "/users/self"),
						{ retryKey: "delete/game-coordinator/users/self" }
					);
					if (res.error) {
						error(res.error);
					}
					AuthManager.ClearSavedAccount();
					Bridge.LoadScene("Login", true, LoadSceneMode.Single);
				});
			}),
		);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
