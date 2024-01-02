import { Controller, OnStart } from "@easy-games/flamework-core";
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
	public LocalUser: User | undefined;

	public OnLocalUserUpdated = new Signal<User>();

	constructor(private readonly authController: AuthController) {}

	OnStart(): void {
		this.authController.OnAuthenticated.Connect(() => {
			task.spawn(() => {
				this.FetchLocalUser();
				if (this.LocalUser) {
					print("Hello " + this.LocalUser.username);
				}
			});
		});

		this.authController.OnSignOut.Connect(() => {
			this.LocalUser = undefined;
		});
	}

	public FetchLocalUser(): void {
		const res = HttpManager.GetAsync(
			`${AirshipUrl.GameCoordinator}/users/self`,
			this.authController.GetAuthHeaders(),
		);
		if (res.success) {
			const data = DecodeJSON(res.data) as User;
			this.LocalUser = data;

			const writeUser = Game.LocalPlayer as Writable<Player>;
			writeUser.userId = data.uid;
			writeUser.username = data.username;
			writeUser.usernameTag = data.discriminator;

			this.OnLocalUserUpdated.Fire(this.LocalUser);
			return;
		}

		// retry
		Task.Delay(1, () => {
			this.FetchLocalUser();
		});
	}
}
