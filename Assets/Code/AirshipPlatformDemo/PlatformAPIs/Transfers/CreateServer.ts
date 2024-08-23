import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";

export default class CreateServer extends AirshipBehaviour {
	public promptLocation: Transform;
	private use = new NetworkSignal("CreateServer");

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
					const server = await Platform.Server.Transfer.CreateServer({
						sceneId: "PlatformAPIs",
					});
					await Platform.Server.Transfer.TransferToServer(player, server.serverId);
				});
				task.delay(5, () => {
					this.use.server.FireClient(player);
				});
			});
		}
	}

	private CreatePrompt() {
		const prompt = Airship.Input.CreateProximityPrompt("interact", this.promptLocation, {
			primaryText: "Create Server",
		});
		prompt.onActivated.Connect(() => {
			Object.Destroy(prompt.gameObject);
			this.use.client.FireServer();
		});
	}

	override OnDestroy(): void {}
}
