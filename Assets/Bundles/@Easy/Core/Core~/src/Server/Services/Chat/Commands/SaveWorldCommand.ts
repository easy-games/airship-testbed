import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ChatColor } from "Shared/Util/ChatColor";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

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
