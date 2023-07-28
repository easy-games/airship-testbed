import { Player } from "Shared/Player/Player";
import { ChatCommand } from "../../../../Commands/ChatCommand";

export class TpsCommand extends ChatCommand {
	constructor() {
		super("tps");
	}

	public Execute(player: Player, args: string[]): void {
		const avg = Bridge.GetAverageFPS();
		const current = Bridge.GetCurrentFPS();

		player.SendMessage("----------------");
		player.SendMessage("Current TPS: " + current);
		player.SendMessage("Avg TPS: " + avg);
		player.SendMessage("----------------");
	}
}
