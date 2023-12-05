import { ChargingAbilityEndedDto } from "Shared/Abilities/Ability";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";

export class AbilityChargeEndClientSignal {
	public constructor(
		public readonly characterEntity: CharacterEntity,
		public readonly chargingAbility: ChargingAbilityEndedDto,
	) {}

	public IsLocalPlayer() {
		return Game.LocalPlayer.character === this.characterEntity;
	}
}
