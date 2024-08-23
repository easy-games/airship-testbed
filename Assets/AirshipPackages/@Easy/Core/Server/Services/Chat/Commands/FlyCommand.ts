import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class FlyCommand extends ChatCommand {
	constructor() {
		super("fly");
	}
	public Execute(player: Player, args: string[]): void {
		if (player.character) {
			const flying = !player.character.movement.IsFlying();
			player.character.movement.SetDebugFlying(flying);
			player.SendMessage(
				flying
					? ColorUtil.ColoredText(Theme.green, "Fly mode enabled.")
					: ColorUtil.ColoredText(Theme.red, "Fly mode disabled."),
			);
		}
	}
}
