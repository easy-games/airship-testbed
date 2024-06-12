import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { AuthController } from "../Auth/AuthController";
import { User } from "./User";

@Controller({})
export class UserController implements OnStart {
	public localUser: User | undefined;

	public onLocalUserUpdated = new Signal<User>();
	private localUserLoaded = false;

	constructor(private readonly authController: AuthController) {
		Protected.user = this;
	}

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
		let success = false;
		if (res.success) {
			if (res.data.size() === 0 || res.data === "") {
				let ignore = false;
				if (Game.coreContext === CoreContext.GAME && Game.IsEditor()) {
					ignore = true;
				}
				if (!ignore) {
					Bridge.LoadScene("Login", true, LoadSceneMode.Single);
					return;
				}
			}
			try {
				const data = DecodeJSON(res.data) as User;
				this.localUser = data;
				this.localUserLoaded = true;
				// print("self: " + res.data);

				if (Game.coreContext === CoreContext.MAIN_MENU || true) {
					const writeUser = Game.localPlayer as Player;
					writeUser.userId = data.uid;
					writeUser.username = data.username;
					Game.localPlayerLoaded = true;
					Game.onLocalPlayerLoaded.Fire();
				}

				success = true;
				this.onLocalUserUpdated.Fire(this.localUser);
			} catch (err) {
				Debug.LogError("Failed to decode /users/self: " + res.data + " error: " + err);
			}
		}

		// retry
		if (!success) {
			task.delay(1, () => {
				this.FetchLocalUser();
			});
		}
	}

	public WaitForLocalUserReady(): void {
		while (!this.localUserLoaded) {
			task.wait();
		}
	}
}
