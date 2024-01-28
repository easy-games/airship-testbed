import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
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
			const data = DecodeJSON(res.data) as User;
			this.localUser = data;

			if (Game.context === CoreContext.MAIN_MENU) {
				const writeUser = Game.localPlayer as Writable<Player>;
				writeUser.userId = data.uid;
				writeUser.username = data.username;
				writeUser.usernameTag = data.discriminator;
				Game.localPlayerLoaded = true;
				Game.onLocalPlayerLoaded.Fire();
			}

			this.onLocalUserUpdated.Fire(this.localUser);
			return;
		}

		// retry
		Task.Delay(1, () => {
			this.FetchLocalUser();
		});
	}
}
