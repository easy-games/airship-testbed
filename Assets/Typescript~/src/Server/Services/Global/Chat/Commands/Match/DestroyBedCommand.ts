import { Dependency } from "@easy-games/flamework-core";
import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { ServerSignals } from "Server/ServerSignals";
import { BedService } from "Server/Services/Match/BedService";

export class DestroyBedCommand extends ChatCommand {
	constructor() {
		super("destroyBed", ["db"]);
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
			if (!world) return;

			const bedVoxelId = world.GetVoxelIdFromId(bedMeta.block!.blockId);

			CoreServerSignals.BeforeBlockDestroyed.Fire({
				blockId: bedVoxelId ?? -1,
				blockPos: bedState.position,
			});
			world.DeleteBlock(bedState.position);
			CoreServerSignals.BlockDestroyed.Fire({
				blockId: bedVoxelId ?? -1,
				blockPos: bedState.position,
			});

			CoreNetwork.ServerToClient.BlockDestroyed.Server.FireAllClients(bedState.position, bedVoxelId);
			ServerSignals.BedDestroyed.Fire({ team: targetTeam });
		}
	}
}
