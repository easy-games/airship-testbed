import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";

export class FlyCommand extends ChatCommand {
	constructor() {
		super("fly");
	}
	public Execute(player: Player, args: string[]): void {
		if (player.character) {
			const newValue = !player.character.entityDriver.IsAllowFlight();
			player.character.entityDriver.SetAllowFlight(newValue);
			player.SendMessage(
				newValue
					? ColorUtil.ColoredText(Theme.green, "Fly mode enabled.")
					: ColorUtil.ColoredText(Theme.red, "Fly mode disabled."),
			);
		}
	}
}
