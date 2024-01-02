import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class StuckCommand extends ChatCommand {
	constructor() {
		super("stuck");
	}

	Execute(player: Player, args: string[]): void {
		if (player.Character) {
			player.Character.Teleport(player.Character.Model.transform.position.add(new Vector3(0, 1.1, 0)));
		}
	}
}
