import { AbilityDto } from "Shared/Abilities/Ability";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";

export class AbilitiesClearedClientSignal {
	public constructor(public readonly characterEntity: CharacterEntity) {}

	public IsLocalPlayer() {
		return Game.LocalPlayer.character === this.characterEntity;
	}
}
