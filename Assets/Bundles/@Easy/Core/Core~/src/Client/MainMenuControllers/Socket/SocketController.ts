import { Controller, OnStart } from "@easy-games/flamework-core";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { SetInterval } from "Shared/Util/Timer";
import { decode, encode } from "Shared/json";
import { AuthController } from "../Auth/AuthController";

@Controller({})
export class SocketController implements OnStart {
	private onEvent = new Signal<[eventName: string, data: string]>();
	constructor(private readonly authController: AuthController) {}
	OnStart(): void {
		SocketManager.Instance.OnEvent((eventName, data) => {
			this.onEvent.Fire(eventName, data);
		});
		SocketManager.SetScriptListening(true);

		if (this.authController.IsAuthenticated()) {
			Task.Spawn(() => {
				this.Connect();
			});
		}
		this.authController.onAuthenticated.Connect(() => {
			Task.Spawn(() => {
				this.Connect();
			});
		});

		// Expires every 6 hours. So we fire every hour.
		SetInterval(
			60 * 60,
			() => {
				this.Emit("set-session-data", {
					selectedRegion: "na",
				});
			},
			true,
		);
	}

	public On<T = unknown>(eventName: string, callback: (data: T) => void): void {
		this.onEvent.Connect((e, d) => {
			if (e === eventName) {
				callback(decode(d));
			}
		});
	}

	public Emit(eventName: string, data: unknown = undefined): void {
		if (data === undefined) {
			data = { _hold: "yes" };
		}
		Task.Spawn(() => {
			SocketManager.EmitAsync(eventName, encode(data));
		});
	}

	private Connect(): void {
		SocketManager.ConnectAsync(AirshipUrl.GameCoordinatorSocket, this.authController.GetAuthToken());
	}
}
