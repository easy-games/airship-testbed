import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { OnStart, Service } from "@easy-games/flamework-core";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { GameAbilities } from "Shared/Strollers/Match/BW/GameAbilities";
import { AbilityId } from "Shared/Abilities/AbilityType";

@Service()
export class BWAbilitiesService implements OnStart {
	constructor(private readonly gameAbilities: GameAbilities) {
		CoreServerSignals.EntitySpawn.Connect((event) => {
			if (event.entity instanceof CharacterEntity && event.entity.player) {
				print(
					"add ability to character",
					event.entity.player.username,
					event.entity.player.character !== undefined,
				);

				this.gameAbilities.AddAbilityToCharacter(AbilityId.RECALL, event.entity);
				this.gameAbilities.AddAbilityToCharacter(AbilityId.VORLIAS_TEST, event.entity);
			}
		});
	}

	OnStart(): void {}
}
