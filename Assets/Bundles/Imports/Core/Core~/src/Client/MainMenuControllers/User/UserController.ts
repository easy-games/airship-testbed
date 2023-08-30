import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { AirshipUrl } from "Shared/Util/Url";
import { decode } from "Shared/json";
import { AuthController } from "../Auth/AuthController";
import { User } from "./User";

@Controller({})
export class UserController implements OnStart {
	public localUser: User | undefined;

	public onLocalUserUpdated = new Signal<User>();

	constructor(private readonly authController: AuthController) {}

	OnStart(): void {
		this.authController.onAuthenticated.Connect(() => {
			Task.Spawn(() => {
				const res = HttpManager.GetAsync(
					`${AirshipUrl.UserService}/users/self`,
					this.authController.GetAuthHeaders(),
				);
				const data = decode(res.data) as User;
				print("got local user: " + inspect(data));
				this.localUser = data;
				(Game.LocalPlayer as Writable<Player>).userId = data.uid;
				this.onLocalUserUpdated.Fire(this.localUser);
			});
		});

		this.authController.onSignOut.Connect(() => {
			this.localUser = undefined;
		});
	}
}
