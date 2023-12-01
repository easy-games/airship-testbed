import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";

abstract class AbilityChatCommand extends ChatCommand {
	public FindAbilityByIdCaseInsensitive(id: string) {
		const registeredAbilities = Dependency<AbilityRegistry>().GetAllRegisteredAbilities();
		for (const [abilityId, ability] of registeredAbilities) {
			if (id.lower() === abilityId.lower()) {
				return ability;
			}
		}
	}
}

export class AddAbilityCommand extends AbilityChatCommand {
	constructor() {
		super("add-ability", ["ability"]);
	}

	public Execute(player: Player, args: string[]): void {
		const entity = player.character;
		const abilities = entity?.GetAbilities();
		if (abilities) {
			const ability = this.FindAbilityByIdCaseInsensitive(args[0]);
			if (ability) {
				abilities.AddAbilityWithId(ability.id, ability);
			}
		}
	}
}

export class AbilityEnableStateCommand extends AbilityChatCommand {
	constructor() {
		super("ability-state", ["ability"]);
	}

	public Execute(player: Player, args: string[]): void {
		const entity = player.character;
		const abilities = entity?.GetAbilities();
		if (abilities) {
			const ability = this.FindAbilityByIdCaseInsensitive(args[0]);
			if (!ability) return;
			const enableState = args[1] === "true" ? true : false;
			abilities.SetAbilityEnabledState(ability.id, enableState);
		}
	}
}

export class RemoveAbilityCommand extends AbilityChatCommand {
	constructor() {
		super("remove-ability", []);
	}

	public Execute(player: Player, args: string[]): void {
		const [id] = args;

		const entity = player.character;
		const abilities = entity?.GetAbilities();
		if (abilities) {
			if (id.lower() === "all") {
				abilities.RemoveAllAbilities();
			} else {
				const ability = this.FindAbilityByIdCaseInsensitive(id);
				if (ability) {
					abilities.RemoveAbilityById(ability.id);
				}
			}
		}
	}
}
