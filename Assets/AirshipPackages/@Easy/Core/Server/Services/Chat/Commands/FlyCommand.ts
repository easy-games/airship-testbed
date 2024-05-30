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
			const newValue = !player.character.movement.IsAllowFlight();
			player.character.movement.SetAllowFlight(newValue);
			player.SendMessage(
				newValue
					? ColorUtil.ColoredText(Theme.green, "Fly mode enabled.")
					: ColorUtil.ColoredText(Theme.red, "Fly mode disabled."),
			);
		}
	}
}
