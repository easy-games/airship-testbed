import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ChatColor } from "Shared/Util/ChatColor";
import { RunUtil } from "Shared/Util/RunUtil";
import { SetInterval } from "Shared/Util/Timer";

export class TpsCommand extends ChatCommand {
	constructor() {
		super("tps");

		if (!RunUtil.IsEditor() && RunUtil.IsServer()) {
			SetInterval(1, () => {
				const avg = Bridge.GetAverageFPS();
				const current = Bridge.GetCurrentFPS();

				const allocatedRam = math.round(Bridge.GetAllocatedRam());
				const reservedRam = math.round(Bridge.GetReservedRam());
				print(
					`TPS current: ${current}, avg: ${avg} | Ram allocated: ${allocatedRam} mb, reserved: ${reservedRam} mb`,
				);
			});
		}
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
