import { Controller } from "@Easy/Core/Shared/Flamework";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { AuthController } from "../Auth/AuthController";

@Controller({})
export class SocketController {
	private onEvent = new Signal<[eventName: string, data: string]>();
	public onSocketConnectionChanged = new Signal<[connected: boolean]>();

	constructor(private readonly authController: AuthController) {}

	protected OnStart(): void {
		SocketManager.Instance.OnEvent((eventName, data) => {
			// print(`[${eventName}]: ${data}`);
			this.onEvent.Fire(eventName, data);
		});
		SocketManager.SetScriptListening(true);

		if (this.authController.IsAuthenticated()) {
			task.spawn(() => {
				this.Connect();
			});
		}
		this.authController.onAuthenticated.Connect(() => {
			task.spawn(() => {
				this.Connect();
			});
			// Expires every 6 hours. So we fire every hour.
			SetInterval(
				60 * 60,
				() => {
					InternalHttpManager.PutAsync(
						AirshipUrl.GameCoordinator + "/user-session/data",
						EncodeJSON({
							regionPriority: ["na"],
						}),
					);
				},
				true,
			);
		});

		SocketManager.Instance.OnDisconnected((reason) => {
			CoreLogger.Warn("Disconnected from socket: " + reason);
			this.onSocketConnectionChanged.Fire(false);
		});
	}

	public On<T = unknown>(eventName: string, callback: (data: T) => void): void {
		this.onEvent.Connect((e, d) => {
			if (e === eventName) {
				callback(DecodeJSON(d));
			}
		});
	}

	public Emit(eventName: string, data: unknown = undefined): void {
		if (data === undefined) {
			data = { _hold: "yes" };
		}
		task.spawn(() => {
			SocketManager.EmitAsync(eventName, EncodeJSON(data));
		});
	}

	public IsConnected(): boolean {
		return SocketManager.IsConnected();
	}

	private Connect(): void {
		SocketManager.ConnectAsyncInternal();
	}
}
