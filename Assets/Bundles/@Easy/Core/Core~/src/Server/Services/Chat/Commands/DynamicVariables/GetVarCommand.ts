import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ChatColor } from "Shared/Util/ChatColor";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";

export class GetVarCommand extends ChatCommand {
	constructor() {
		super("getvar", [], "<collection ID> <value>");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() !== 1) {
			player.SendMessage(ColorUtil.ColoredText(Theme.Red, "Invalid usage: /getvar <var collection>.<key>"));
			player.SendMessage(ColorUtil.ColoredText(Theme.Red, "Example: /getvar combat.kbY"));
			return;
		}
		let split = args[0].split(".");
		if (split.size() !== 2) {
			player.SendMessage(ColorUtil.ColoredText(Theme.Red, `Invalid DynamicVariables key: ` + args[0]));
			return;
		}

		let varsKey = split[0];
		const vars = DynamicVariablesManager.Instance.GetVars(varsKey);
		if (vars === undefined) {
			player.SendMessage(ColorUtil.ColoredText(Theme.Red, `DynamicVariables with key "${varsKey}" not found.`));
			return;
		}

		let key = split[1];

		player.SendMessage(ChatColor.Yellow(args[0]) + ChatColor.Gray(": ") + ChatColor.White(vars.GetAsString(key)));
	}
}
