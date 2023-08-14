import { Dependency } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Imports/Core/Server/CoreServerSignals";
import { TeamService } from "Imports/Core/Server/Services/Team/TeamService";
import { ChatCommand } from "Imports/Core/Shared/Commands/ChatCommand";
import { CoreNetwork } from "Imports/Core/Shared/CoreNetwork";
import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { ItemUtil } from "Imports/Core/Shared/Item/ItemUtil";
import { Player } from "Imports/Core/Shared/Player/Player";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";
import { ServerSignals } from "Server/ServerSignals";
import { BedService } from "Server/Services/Match/BedService";

export class DestroyBedCommand extends ChatCommand {
	constructor() {
		super("destroyBed");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage("Invalid arguments.");
		}

		const teamName = args[0];

		/* Validate team. */
		const targetTeam = Dependency<TeamService>().GetTeamByName(teamName);
		if (!targetTeam) {
			player.SendMessage(`Invalid team name: ${teamName}`);
			return;
		}

		/* Destroy bed. */
		const bedState = Dependency<BedService>().GetBedStateForTeam(targetTeam);
		if (!bedState || bedState.destroyed) {
			player.SendMessage("Bed does not exist or is already destroyed.");
		} else {
			const bedMeta = ItemUtil.GetItemMeta(ItemType.BED);
			const world = WorldAPI.GetMainWorld();
			world.PlaceBlockById(bedState.position, 0);
			CoreServerSignals.BlockDestroyed.Fire({
				blockId: bedMeta.block?.blockId ?? -1,
				blockMeta: bedMeta,
				blockPos: bedState.position,
			});
			CoreNetwork.ServerToClient.BlockDestroyed.Server.FireAllClients(bedState.position, bedMeta.block!.blockId);
			ServerSignals.BedDestroyed.Fire({ team: targetTeam });
		}
	}
}
