import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";

export class AbilityStateUpdateSignal {
	public constructor(
		public readonly characterEntity: CharacterEntity,
		public readonly abilityId: string,
		public readonly enabled: boolean,
	) {}

	public IsLocalPlayer() {
		return Game.LocalPlayer.character === this.characterEntity;
	}
}
