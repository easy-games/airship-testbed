import { ChargingAbilityDto, ChargingAbilityEndedDto, ChargingAbilityEndedState } from "Shared/Abilities/Ability";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Projectile } from "Shared/Projectile/Projectile";

export class AbilityChargeEndClientSignal {
	public constructor(
		public readonly characterEntity: CharacterEntity,
		public readonly chargingAbility: ChargingAbilityEndedDto,
	) {}

	public IsLocalPlayer() {
		return Game.LocalPlayer.character === this.characterEntity;
	}
}
