import { TransferService } from "@Easy/Core/Server/Services/Transfer/TransferService";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Dependency } from "@easy-games/flamework-core";
import { BedWars } from "Shared/BedWars/BedWars";

export class LobbyCommand extends ChatCommand {
	constructor() {
		super("lobby", undefined, undefined, "Sends you to the Lobby.");
	}

	override Execute(player: Player, args: string[]): void {
		Dependency<TransferService>().TransferToGame(player, BedWars.GameId, {
			startSceneId: "BWLobbyScene",
		});
	}
}
