import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Dependency } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { StatusEffectService } from "Server/Services/Global/StatusEffect/StatusEffectService";
import { GetStatusEffectMeta } from "Shared/StatusEffect/StatusEffectDefinitions";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";

export class AddStatusEffectCommand extends ChatCommand {
	constructor() {
		super("addStatusEffect", ["giveStatusEffect", "addStatus", "ase"]);
	}

	public Execute(player: Player, args: string[]): void {
		// Invalid args size.
		if (args.size() !== 2) {
			player.SendMessage(`Invalid argument count. Expecting (2) {statusEffectType} {tier}.`);
			return;
		}
		const allStatusEffects = ObjectUtils.values(StatusEffectType);
		const statusEffectType = args[0] as StatusEffectType;
		// Status effect type does not exist.
		if (!allStatusEffects.includes(statusEffectType)) {
			player.SendMessage(`Invalid status effect type. Provided value: ${statusEffectType}`);
			return;
		}
		const statusEffectMeta = GetStatusEffectMeta(statusEffectType);
		const tier = tonumber(args[1]);
		// Provided tier was not a number.
		if (tier === undefined) {
			player.SendMessage(`Please enter a numeric tier. Provided value: ${tier}`);
			return;
		}
		// Provided tier was less than one.
		if (tier < 1) {
			player.SendMessage(
				`Provided status effect tier is less than 1. Please provide a value that is at least 1, and no more than ${statusEffectMeta.maxTier}.`,
			);
			return;
		}
		// Provided tier was greater than the status effect max tier.
		if (tier > statusEffectMeta.maxTier) {
			player.SendMessage(
				`Provided tier is greater than status effect max tier. Max tier: ${statusEffectMeta.maxTier}`,
			);
			return;
		}
		// Validated input! Try to give client status effect.
		const result = Dependency<StatusEffectService>().AddStatusEffectToClient(
			player.clientId,
			statusEffectType,
			tier,
		);
		if (result) {
			player.SendMessage(`Successfully applied status effect: ${statusEffectType}`);
		} else {
			player.SendMessage(`Could not apply status effect: ${statusEffectType}`);
		}
	}
}
