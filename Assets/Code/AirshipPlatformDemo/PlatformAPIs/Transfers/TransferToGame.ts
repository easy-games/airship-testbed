import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";

export default class TransferToGame extends AirshipBehaviour {
	public promptLocation: Transform;
	private use = new NetworkSignal("TransferToGame");

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
					await Platform.Server.Transfer.TransferToGame(player, Game.gameId);
				});
				task.delay(5, () => {
					this.use.server.FireClient(player);
				});
			});
		}
	}

	private CreatePrompt() {
		const prompt = Airship.Input.CreateProximityPrompt("interact", this.promptLocation, {
			primaryText: "Transfer To Game",
		});
		prompt.onActivated.Connect(() => {
			Object.Destroy(prompt.gameObject);
			this.use.client.FireServer();
		});
	}

	override OnDestroy(): void {}
}

// export default class CreateServer extends AirshipBehaviour {
// 	public promptLocation: Transform;
// 	private use = new NetworkSignal("CreateServer");

// 	override Start(): void {
// 		if (Game.IsClient()) {
// 			this.CreatePrompt();
// 			this.use.client.OnServerEvent(() => {
// 				this.CreatePrompt();
// 			});
// 		}

// 		if (Game.IsServer()) {
// 			this.use.server.OnClientEvent((p) => {
// 				print("creating!");
// 				task.delay(5, () => {
// 					this.use.server.FireClient(p);
// 				});
// 			});
// 		}
// 	}

// 	private CreatePrompt() {
// 		const prompt = Airship.Input.CreateProximityPrompt("interact", this.promptLocation, {
// 			primaryText: "Create Server",
// 		});
// 		prompt.onActivated.Connect(() => {
// 			Object.Destroy(prompt.gameObject);
// 			this.use.client.FireServer();
// 		});
// 	}

// 	override OnDestroy(): void {}
// }
