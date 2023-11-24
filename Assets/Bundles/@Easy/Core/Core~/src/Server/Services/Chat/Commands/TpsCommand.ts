import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ChatColor } from "Shared/Util/ChatColor";

export class TpsCommand extends ChatCommand {
	constructor() {
		super("tps");
	}

	public Execute(player: Player, args: string[]): void {
		const avg = Bridge.GetAverageFPS();
		const current = Bridge.GetCurrentFPS();

		const allocatedRam = math.round(Bridge.GetAllocatedRam());
		const reservedRam = math.round(Bridge.GetReservedRam());

		player.SendMessage(ChatColor.Yellow("TPS current: " + current + ", avg: " + avg));
		player.SendMessage(
			ChatColor.Yellow("Ram allocated: " + allocatedRam + " mb, reserved: " + reservedRam + " mb"),
		);
	}
}
