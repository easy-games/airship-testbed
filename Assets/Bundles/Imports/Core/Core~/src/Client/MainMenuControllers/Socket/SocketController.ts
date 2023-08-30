import { Controller, OnStart } from "@easy-games/flamework-core";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { AirshipUrl } from "Shared/Util/Url";
import { encode } from "Shared/json";
import { AuthController } from "../Auth/AuthController";

@Controller({})
export class SocketController implements OnStart {
	public onEvent = new Signal<[eventName: string, data: string]>();
	constructor(private readonly authController: AuthController) {}
	OnStart(): void {
		SocketManager.Instance.OnEvent((eventName, data) => {
			print(`[${eventName}]: ${data}`);
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
	}

	public Emit(eventName: string, data: unknown): void {
		Task.Spawn(() => {
			SocketManager.EmitAsync(eventName, encode(data));
		});
	}

	private Connect(): void {
		print("Connecting to socket...");
		SocketManager.ConnectAsync(AirshipUrl.GameCoordinatorSocket, this.authController.GetAuthToken());
		print("Connected to socket!");
	}
}
