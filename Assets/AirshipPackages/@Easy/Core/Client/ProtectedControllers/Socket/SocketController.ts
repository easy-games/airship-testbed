import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { AuthController } from "../Auth/AuthController";
import { HttpRetryInstance } from "@Easy/Core/Shared/Http/HttpRetry";

@Controller({})
export class SocketController {
	private readonly httpRetry = HttpRetryInstance();
	private onEvent = new Signal<[eventName: string, data: string]>();
	public onSocketConnectionChanged = new Signal<[connected: boolean]>();
	public doReconnect = true;

	constructor(private readonly authController: AuthController) {}

	protected OnStart(): void {
		SocketManager.Instance.OnEvent((eventName, data) => {
			// CoreLogger.Log(`Socket [${eventName}]: ${data}`);
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
					this.httpRetry(() => InternalHttpManager.PutAsync(
						AirshipUrl.GameCoordinator + "/user-session/data",
						json.encode({
							regionPriority: ["na"],
						}),
					), "UpdateUserSessionData").expect();
				},
				true,
			);
		});

		SocketManager.Instance.OnDisconnected((reason) => {
			CoreLogger.Warn("Disconnected from socket: " + reason);
			this.onSocketConnectionChanged.Fire(false);

			if (this.doReconnect) {
				this.Connect();
			}
		});

		this.On("new-connection-created", (data) => {
			this.doReconnect = false;
		});
	}

	public On<T = unknown>(eventName: string, callback: (data: T) => void): () => void {
		return this.onEvent.Connect((e, d) => {
			if (e === eventName) {
				callback(json.decode(d));
			}
		});
	}

	public Emit(eventName: string, data: unknown = undefined): void {
		if (data === undefined) {
			data = { _hold: "yes" };
		}
		task.spawn(() => {
			SocketManager.EmitAsync(eventName, json.encode(data));
		});
	}

	public IsConnected(): boolean {
		return SocketManager.IsConnected();
	}

	public Connect(): void {
		if (Game.IsEditor() && !Game.IsInternal()) return;
		this.doReconnect = true;
		let connected = SocketManager.ConnectAsyncInternal();
		this.onSocketConnectionChanged.Fire(connected);
	}
}
