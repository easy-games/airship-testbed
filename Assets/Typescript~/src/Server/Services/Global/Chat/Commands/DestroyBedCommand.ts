import { Dependency } from "@easy-games/flamework-core";
import { BWServerSignals } from "Server/BWServerSignals";
import { ServerSignals } from "Server/ServerSignals";
import { BedService } from "Server/Services/Match/BedService";
import { ItemType } from "Shared/Item/ItemType";
import { Network } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { ItemUtil } from "../../../../../Shared/Item/ItemUtil";
import { ChatCommand } from "../../../../Commands/ChatCommand";
import { TeamService } from "../../Team/TeamService";

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
			ServerSignals.BlockDestroyed.Fire({
				blockId: bedMeta.block?.blockId ?? -1,
				blockMeta: bedMeta,
				blockPos: bedState.position,
			});
			Network.ServerToClient.BlockDestroyed.Server.FireAllClients(bedState.position, bedMeta.block!.blockId);
			BWServerSignals.BedDestroyed.Fire({ team: targetTeam });
		}
	}
}
