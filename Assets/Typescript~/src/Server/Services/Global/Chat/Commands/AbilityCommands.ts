import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Dependency } from "@easy-games/flamework-core";
import { AbilityService } from "Server/Services/Abilities/AbilityService";
import { Ability, AbilityRegistry } from "Shared/Abilities/AbilityRegistry";

abstract class AbilityChatCommand extends ChatCommand {
	/**
	 * Returns ability meta for provided ability from registry, if it exists.
	 *
	 * @param requestAbilityId The ability Id.
	 * @returns The ability meta from ability registry, if it exists.
	 */
	public FindAbilityByIdCaseInsensitive(requestAbilityId: string): Ability | undefined {
		const registeredAbilities = Dependency<AbilityRegistry>().GetAllRegisteredAbilities();
		for (const [abilityId, ability] of registeredAbilities) {
			if (requestAbilityId.lower() === abilityId.lower()) {
				return ability;
			}
		}
		return undefined;
	}
}

export class AddAbilityCommand extends AbilityChatCommand {
	constructor() {
		super("addAbility");
	}

	public Execute(player: Player, args: string[]): void {
		const [id] = args;
		const ability = this.FindAbilityByIdCaseInsensitive(id);
		if (!ability) return;
		Dependency<AbilityService>().AddAbilityToClient(player.clientId, ability.id);
	}
}

export class RemoveAbilityCommand extends AbilityChatCommand {
	constructor() {
		super("removeAbility");
	}

	public Execute(player: Player, args: string[]): void {
		const [id] = args;
		const ability = this.FindAbilityByIdCaseInsensitive(id);
		if (!ability) return;
		Dependency<AbilityService>().RemoveAbilityFromClient(player.clientId, ability?.id);
	}
}

export class AbilityEnableStateCommand extends AbilityChatCommand {
	constructor() {
		super("abilityState");
	}

	public Execute(player: Player, args: string[]): void {
		const ability = this.FindAbilityByIdCaseInsensitive(args[0]);
		if (!ability) return;
		const enableState = args[1] === "true" ? true : false;
		Dependency<AbilityService>().SetAbilityEnabledState(player.clientId, ability.id, enableState);
	}
}
