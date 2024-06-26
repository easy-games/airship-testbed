import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { WorldAPI } from "@Easy/Survival/Shared/VoxelWorld/WorldAPI";

export class SaveWorldCommand extends ChatCommand {
	constructor() {
		super("saveworld");
	}

	public Execute(player: Player, args: string[]): void {
		const world = WorldAPI.GetMainWorld();
		if (!world) return;

		player.SendMessage("Saving world...");
		world.voxelWorld.SaveToFile();
		player.SendMessage(ChatColor.Green("Finished saving world!"));
	}
}
