import { ChargingAbilityDto } from "Shared/Abilities/Ability";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";

export class AbilityChargeClientSignal {
	public constructor(
		public readonly characterEntity: CharacterEntity,
		public readonly chargingAbility: ChargingAbilityDto,
	) {}

	public IsLocalPlayer() {
		return Game.LocalPlayer.character === this.characterEntity;
	}
}
