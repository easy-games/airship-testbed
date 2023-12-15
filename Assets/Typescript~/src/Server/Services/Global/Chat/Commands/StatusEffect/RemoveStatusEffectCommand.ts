import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Dependency } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { StatusEffectService } from "Server/Services/Global/StatusEffect/StatusEffectService";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";

export class RemoveStatusEffectCommand extends ChatCommand {
	constructor() {
		super("removeStatusEffect", ["removeStatus", "deleteStatusEffect", "rse"]);
	}

	public Execute(player: Player, args: string[]): void {
		// Invalid args size.
		if (args.size() !== 1) {
			player.SendMessage(`Invalid argument count. Expecting (1) {statusEffectType}.`);
			return;
		}
		const allStatusEffects = ObjectUtils.values(StatusEffectType);
		const statusEffectType = args[0] as StatusEffectType;
		// Status effect type does not exist.
		if (!allStatusEffects.includes(statusEffectType)) {
			player.SendMessage(`Invalid status effect type. Provided value: ${statusEffectType}`);
			return;
		}
		// Validated! Try to remove status effect from client.
		// Note: If the client did **not** have the provided status effect type, this call with do nothing.
		const result = Dependency<StatusEffectService>().RemoveStatusEffectFromClient(
			player.clientId,
			statusEffectType,
		);
		if (result) {
			player.SendMessage(`Successfully removed status effect: ${statusEffectType}`);
		} else {
			player.SendMessage(`Could not remove status effect: ${statusEffectType}`);
		}
	}
}
