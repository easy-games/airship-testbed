import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Dependency } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { StatusEffectService } from "Server/Services/Global/StatusEffect/StatusEffectService";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";

export class RemoveStatusEffectCommand extends ChatCommand {
	constructor() {
		super("removeStatusEffect");
	}

	public Execute(player: Player, args: string[]): void {
		const allStatusEffects = ObjectUtils.values(StatusEffectType);
		const statusEffectType = args[0] as StatusEffectType;
		// Status effect type does not exist.
		if (!allStatusEffects.includes(statusEffectType)) {
			player.SendMessage(`Invalid status effect type. Provided value: ${statusEffectType}`);
			return;
		}
		// Validated! Remove status effect from client.
		// Note: If the client did **not** have the provided status effect type, this call with do nothing.
		Dependency<StatusEffectService>().RemoveStatusEffectFromClient(player.clientId, statusEffectType);
	}
}
