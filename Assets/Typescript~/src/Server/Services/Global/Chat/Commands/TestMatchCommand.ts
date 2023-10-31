import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { decode, encode } from "@Easy/Core/Shared/json";
import { Dependency } from "@easy-games/flamework-core";

export class TestMatchCommand extends ChatCommand {
	constructor() {
		super("testMatch", ["tm"], undefined, "Teleports all players on the server to a test match.");
	}

	Execute(player: Player, args: string[]): void {
		player.SendMessage("Creating server...");
		const serverBootstrap = GameObject.Find("ServerBootstrap")?.GetComponent<ServerBootstrap>();
		const res = HttpManager.PostAsync(
			AirshipUrl.GameCoordinatorSocket + "/servers/create",
			encode({
				sceneId: "BWMatchScene",
			}),
			`Authorization=Bearer ${serverBootstrap.airshipJWT}`,
		);
		if (res.success) {
			const data = decode<{
				serverId: string;
			}>(res.data);
			player.SendMessage(`Created server with ID "${data.serverId}". Teleporting all players...`);
			for (const player of Dependency<PlayerService>().GetPlayers()) {
				player.TransferToServer(data.serverId);
			}
		}
	}
}
