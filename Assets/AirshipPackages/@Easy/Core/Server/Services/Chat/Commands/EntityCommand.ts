import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class EntityCommand extends ChatCommand {
	constructor() {
		super("entity", ["e"], "[health]", "Spawns an NPC", true);
	}

	public Execute(player: Player, args: string[]): void {
		if (!player.character) return;
		const pos = player.character.gameObject.transform.position;
		const character = Airship.Characters.SpawnNonPlayerCharacter(pos);
		if (args.size() >= 1) {
			const health = tonumber(args[0]);
			if (health !== undefined) {
				character.SetMaxHealth(health);
				character.SetHealth(health);
			}
		}
	}
}
