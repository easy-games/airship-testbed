import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";

export class LagCommand extends ChatCommand {
	constructor() {
		super("lag", [], `["off" | ping]`);
		this.requiresPermission = true;
	}

	public Execute(player: Player, args: string[]): void {
		player.SendMessage(ChatColor.Red("Not implemented."));
		// const transportManager = GameObject.Find("Network").GetComponent<TransportManager>();
		// //const transportManager = GameObject.FindAnyObjectByType<TransportManager>();
		// if(!transportManager){
		// 	error("Unable to find transport manager in lag command");
		// }
		// if (transportManager.LatencySimulator.GetEnabled() && (args.size() === 0 || args[0].lower() === "off")) {
		// 	transportManager.LatencySimulator.SetEnabled(false);
		// 	player.SendMessage("Disabled lag sim.");
		// 	return;
		// }
		// let latency = 90;
		// if (args.size() > 0) {
		// 	const num = tonumber(args[0]);
		// 	if (num !== undefined) {
		// 		latency = num;
		// 	}
		// }
		// player.SendMessage(`Enabled lag sim of ${latency}ms`);
		// transportManager.LatencySimulator.SetLatency(latency);
		// transportManager.LatencySimulator.SetEnabled(true);
	}
}
