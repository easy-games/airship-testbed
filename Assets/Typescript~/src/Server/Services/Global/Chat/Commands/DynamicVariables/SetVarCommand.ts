import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { ChatCommand } from "../ChatCommand";

export class SetVarCommand extends ChatCommand {
	constructor() {
		super("setvar");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() !== 2) {
			player.SendMessage(
				ColorUtil.ColoredText(Theme.Red, "Invalid usage: /setvar <var collection>.<key> <value>"),
			);
			player.SendMessage(ColorUtil.ColoredText(Theme.Red, "Example: /setvar combat.kbY 11"));
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
		let valueString = args[1];

		let set = false;

		// Number
		let valueNumber = tonumber(valueString);
		if (valueNumber !== undefined) {
			vars.SetNumber(key, valueNumber);
			set = true;
		}

		// Vector3
		{
			const split = args[1].split(",");
			if (split.size() === 3) {
				const x = tonumber(split[0]);
				const y = tonumber(split[1]);
				const z = tonumber(split[2]);
				if (x !== undefined && y !== undefined && z !== undefined) {
					let vec = new Vector3(x, y, z);
					vars.SetVector3(key, vec);
					set = true;
				}
			}
		}

		// String
		if (!set) {
			vars.SetString(key, valueString);
			set = true;
		}

		if (!set) {
			player.SendMessage(ColorUtil.ColoredText(Theme.Red, `Failed to parse value "${valueString}"`));
			return;
		}

		Game.BroadcastMessage(
			ColorUtil.ColoredText(Theme.Aqua, player.username) +
				ColorUtil.ColoredText(Theme.Gray, " set var ") +
				ColorUtil.ColoredText(Theme.Yellow, args[0]) +
				ColorUtil.ColoredText(Theme.Gray, " to " + ColorUtil.ColoredText(Theme.White, valueString)),
		);
	}
}
