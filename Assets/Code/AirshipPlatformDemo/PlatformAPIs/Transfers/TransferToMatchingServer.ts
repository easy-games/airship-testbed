import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";

export default class TransferToMatchingServer extends AirshipBehaviour {
	public promptLocation: Transform;
	private use = new NetworkSignal("TransferToMatchingServer");

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
					// Create a server to match on. This isn't required if you know there are already servers running with this configuration.
					await Platform.Server.Transfer.CreateServer({
						sceneId: "PlatformAPIs",
						tags: ["custom"],
					});

					await Platform.Server.Transfer.TransferToMatchingServer(player, {
						sceneId: "PlatformAPIs",
						tag: "custom",
					});
				});
				task.delay(5, () => {
					this.use.server.FireClient(player);
				});
			});
		}
	}

	private CreatePrompt() {
		const prompt = Airship.Input.CreateProximityPrompt("interact", this.promptLocation, {
			primaryText: "Transfer To Matching Server",
		});
		prompt.onActivated.Connect(() => {
			Object.Destroy(prompt.gameObject);
			this.use.client.FireServer();
		});
	}

	override OnDestroy(): void {}
}
