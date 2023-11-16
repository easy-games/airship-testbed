import { Dependency } from "@easy-games/flamework-core";
import { BlockInteractService } from "@Easy/Core/Server/Services/Block/BlockInteractService";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { BWBedService } from "Server/Services/Match/BW/BWBedService";

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
		const bedState = Dependency<BWBedService>().GetBedStateForTeam(targetTeam);
		if (!bedState || bedState.destroyed) {
			player.SendMessage("Bed does not exist or is already destroyed.");
		} else {
			const bedMeta = ItemUtil.GetItemMeta(ItemType.BED);
			const world = WorldAPI.GetMainWorld();
			if (!world) return;

			Dependency<BlockInteractService>().DamageBlock(
				player.character,
				ItemUtil.GetItemMeta(ItemType.DIAMOND_PICKAXE).breakBlock!,
				bedState.position,
			);
		}
	}
}
