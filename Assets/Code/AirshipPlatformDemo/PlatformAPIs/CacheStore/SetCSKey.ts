import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class SetCSKey extends AirshipBehaviour {
	public promptLocation: Transform;
	private use = new NetworkSignal("SetCSKey");

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
					const res = await Platform.Server.CacheStore.SetKey("mykey", "data", 60);

					print(inspect(res));

					const getRes = await Platform.Server.CacheStore.GetKey("mykey");

					print(inspect(getRes));
				});
				task.delay(5, () => {
					this.use.server.FireClient(player);
				});
			});
		}
	}

	private CreatePrompt() {
		const prompt = Airship.Input.CreateProximityPrompt("interact", this.promptLocation, {
			primaryText: "Set Key",
		});
		prompt.onActivated.Connect(() => {
			Object.Destroy(prompt.gameObject);
			this.use.client.FireServer();
		});
	}

	override OnDestroy(): void {}
}
