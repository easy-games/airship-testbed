import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class GetSetDSKey extends AirshipBehaviour {
	public promptLocation: Transform;
	private use = new NetworkSignal("GetSetDSKey");

	override Start(): void {
		if (Game.IsClient()) {
			this.CreatePrompt();
			this.use.client.OnServerEvent(() => {
				this.CreatePrompt();
			});
		}

		if (Game.IsServer()) {
			this.use.server.OnClientEvent((player) => {
				task.spawn(async () => {
					const result = await Platform.Server.DataStore.GetAndSet<{ my: "data" | "data2" }>(
						"mygetkey",
						(record) => {
							if (record?.my === "data") {
								return {
									my: "data2",
								};
							} else {
								return {
									my: "data",
								};
							}
						},
					);
					print(inspect(result));
				});
				task.delay(5, () => {
					this.use.server.FireClient(player);
				});
			});
		}
	}

	private CreatePrompt() {
		const prompt = Airship.Input.CreateProximityPrompt("interact", this.promptLocation, {
			primaryText: "GetSet Key",
		});
		prompt.onActivated.Connect(() => {
			Object.Destroy(prompt.gameObject);
			this.use.client.FireServer();
		});
	}

	override OnDestroy(): void {}
}
