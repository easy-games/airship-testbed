import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Imports/Core/Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { PlayerService } from "../../Player/PlayerService";

export class TpAllCommand extends ChatCommand {
	constructor() {
		super("tpAll");
	}

	public Execute(player: Player, args: string[]): void {
		const pos = player.Character?.gameObject.transform.position;
		if (!pos) return;

		for (const p of Dependency<PlayerService>().GetPlayers()) {
			if (p !== player) {
				if (p.Character) {
					const humanoid = p.Character.gameObject.GetComponent<EntityDriver>();
					humanoid.Teleport(pos);
				}
			}
		}
	}
}
