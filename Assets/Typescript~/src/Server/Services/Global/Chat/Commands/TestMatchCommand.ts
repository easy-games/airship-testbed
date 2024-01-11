import { TransferService } from "@Easy/Core/Server/Airship/Transfer/TransferService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Dependency } from "@easy-games/flamework-core";

export class TestMatchCommand extends ChatCommand {
	constructor() {
		super("testMatch", ["tm"], undefined, "Teleports all players on the server to a test match.");
	}

	async Execute(player: Player, args: string[]): Promise<void> {
		player.SendMessage("Creating server...");
		const server = await Dependency<TransferService>().CreateServer("BWMatchScene");
		if (!server.success) {
			player.SendMessage("Failed to create server.");
			return;
		}
		player.SendMessage(`Created server with ID "${server.data.serverId}". Teleporting all players...`);
		const players = Dependency<PlayerService>().GetPlayers();
		await Dependency<TransferService>().TransferGroupToServer(players, server.data.serverId);
	}
}
