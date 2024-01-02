import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";

export class FlyCommand extends ChatCommand {
	constructor() {
		super("fly");
	}
	public Execute(player: Player, args: string[]): void {
		if (player.Character) {
			const newValue = !player.Character.EntityDriver.IsAllowFlight();
			player.Character.EntityDriver.SetAllowFlight(newValue);
			player.SendMessage(
				newValue
					? ColorUtil.ColoredText(Theme.Green, "Fly mode enabled.")
					: ColorUtil.ColoredText(Theme.Red, "Fly mode disabled."),
			);
		}
	}
}
