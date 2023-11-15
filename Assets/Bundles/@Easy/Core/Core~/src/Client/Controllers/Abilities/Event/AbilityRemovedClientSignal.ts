import { AbilityDto } from "Shared/Abilities/Ability";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";

export class AbilityRemovedClientSignal {
	public constructor(public readonly characterEntity: CharacterEntity, public readonly ability: AbilityDto) {}

	public IsLocalPlayer() {
		return Game.LocalPlayer.character === this.characterEntity;
	}
}
