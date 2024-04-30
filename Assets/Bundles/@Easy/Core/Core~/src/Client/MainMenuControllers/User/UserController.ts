import { CoreContext } from "Shared/CoreClientContext";
import { Controller, OnStart } from "Shared/Flamework";
import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { DecodeJSON } from "Shared/json";
import { AuthController } from "../Auth/AuthController";
import { User } from "./User";

@Controller({})
export class UserController implements OnStart {
	public localUser: User | undefined;

	public onLocalUserUpdated = new Signal<User>();
	private localUserLoaded = false;

	constructor(private readonly authController: AuthController) {}

	OnStart(): void {
		this.authController.onAuthenticated.Connect(() => {
			task.spawn(() => {
				this.FetchLocalUser();
			});
		});

		this.authController.onSignOut.Connect(() => {
			this.localUser = undefined;
		});
	}

	public FetchLocalUser(): void {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/users/self`);
		if (res.success) {
			if (res.data.size() === 0 || res.data === "") {
				let ignore = false;
				if (Game.coreContext === CoreContext.GAME && Game.IsEditor()) {
					ignore = true;
				}
				if (!ignore) {
					Bridge.LoadScene("Login", true);
					return;
				}
			}
			try {
				const data = DecodeJSON(res.data) as User;
				this.localUser = data;
				this.localUserLoaded = true;

				if (Game.coreContext === CoreContext.MAIN_MENU || true) {
					const writeUser = Game.localPlayer as Writable<Player>;
					writeUser.userId = data.uid;
					writeUser.username = data.username;
					Game.localPlayerLoaded = true;
					Game.onLocalPlayerLoaded.Fire();
				}

				this.onLocalUserUpdated.Fire(this.localUser);
			} catch (err) {
				Debug.LogError("Failed to decode /users/self: " + res.data + " error: " + err);
			}
		}

		// retry
		Task.Delay(1, () => {
			this.FetchLocalUser();
		});
	}

	public WaitForLocalUserReady(): void {
		while (!this.localUserLoaded) {
			task.wait();
		}
	}
}
