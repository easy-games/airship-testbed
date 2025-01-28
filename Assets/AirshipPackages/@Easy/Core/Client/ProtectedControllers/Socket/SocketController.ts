import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { AuthController } from "../Auth/AuthController";

@Controller({})
export class SocketController {
	private onEvent = new Signal<[eventName: string, data: string]>();
	public onSocketConnectionChanged = new Signal<[connected: boolean]>();
	public doReconnect = true;
	public cancelSessionReportTask: () => void | undefined;

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
			if (this.cancelSessionReportTask) this.cancelSessionReportTask();
			// Expires every 6 hours. Run every 5 minutes to keep up to date.
			this.cancelSessionReportTask = SetInterval(
				60 * 5,
				async () => {
					const regions = InternalHttpManager.GetAsync(
						AirshipUrl.GameCoordinator + "/servers/regions/ping-servers",
					);
					if (!regions.success) {
						return warn("Unable to retrieve ping servers from GC. Region selection may not be possible.");
					}
					const serverMap = json.decode(regions.data) as { [regionId: string]: string };
					const regionLatencies: { [regionId: string]: number } = {};
					for (const [regionId, serverUrl] of ObjectUtils.entries(serverMap)) {
						try {
							regionLatencies[regionId] = UdpPingTool.GetPing(serverUrl);
						} catch (err) {
							warn(
								`Unable to calculate latency for "${regionId}" (${serverUrl}). This region will not be reported.`,
								err,
							);
						}
					}
					print(`Region Latency Report:`, inspect(regionLatencies));
					InternalHttpManager.PutAsync(
						AirshipUrl.GameCoordinator + "/user-session/data",
						json.encode({
							regionLatencies,
						}),
					);
				},
				true,
			);
		});

		this.authController.onSignOut.Connect(() => {
			if (this.cancelSessionReportTask) this.cancelSessionReportTask();
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
