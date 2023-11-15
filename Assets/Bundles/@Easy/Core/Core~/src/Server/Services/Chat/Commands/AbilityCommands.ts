import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";

export class AddAbilityCommand extends ChatCommand {
	constructor() {
		super("add-ability", ["ability"]);
	}

	public Execute(player: Player, args: string[]): void {
		const entity = player.character;
		const abilities = entity?.GetAbilities();
		if (abilities) {
			const ability = Dependency<AbilityRegistry>().GetAbilityById(args[0]);
			if (ability) {
				abilities.AddAbilityWithId(ability.id, ability);
			}
		}
	}
}

export class RemoveAbilityCommand extends ChatCommand {
	constructor() {
		super("remove-ability", []);
	}

	public Execute(player: Player, args: string[]): void {
		const entity = player.character;
		const abilities = entity?.GetAbilities();
		if (abilities) {
			const ability = Dependency<AbilityRegistry>().GetAbilityById(args[0]);
			if (ability) {
				abilities.RemoveAbilityById(ability.id);
			}
		}
	}
}
