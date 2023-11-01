import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { TransferService } from "@Easy/Core/Server/Services/Transfer/TransferService";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Dependency } from "@easy-games/flamework-core";

export class TestMatchCommand extends ChatCommand {
	constructor() {
		super("testMatch", ["tm"], undefined, "Teleports all players on the server to a test match.");
	}

	Execute(player: Player, args: string[]): void {
		player.SendMessage("Creating server...");
		const server = Dependency<TransferService>().CreateServer("BWMatchScene");
		if (!server) {
			player.SendMessage("Failed to create server.");
			return;
		}
		player.SendMessage(`Created server with ID "${server.serverId}". Teleporting all players...`);
		for (const player of Dependency<PlayerService>().GetPlayers()) {
			player.TransferToServer(server.serverId);
		}
	}
}
