import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class GetVarCommand extends ChatCommand {
	constructor() {
		super("getvar", [], "<collection ID> <value>");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() !== 1) {
			player.SendMessage(ColorUtil.ColoredText(Theme.red, "Invalid usage: /getvar <var collection>.<key>"));
			player.SendMessage(ColorUtil.ColoredText(Theme.red, "Example: /getvar combat.kbY"));
			return;
		}
		let split = args[0].split(".");
		if (split.size() !== 2) {
			player.SendMessage(ColorUtil.ColoredText(Theme.red, `Invalid DynamicVariables key: ` + args[0]));
			return;
		}

		let varsKey = split[0];
		const vars = DynamicVariablesManager.Instance.GetVars(varsKey);
		if (vars === undefined) {
			player.SendMessage(ColorUtil.ColoredText(Theme.red, `DynamicVariables with key "${varsKey}" not found.`));
			return;
		}

		let key = split[1];

		player.SendMessage(ChatColor.Yellow(args[0]) + ChatColor.Gray(": ") + ChatColor.White(vars.GetAsString(key)));
	}
}
