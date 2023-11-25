import { OnStart, OnTick, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { AbilityCancellationTrigger } from "Shared/Abilities/Ability";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Player } from "Shared/Player/Player";
import { SignalPriority } from "Shared/Util/Signal";

@Service()
export class AbilitiesService implements OnStart {
	public OnStart(): void {
		CoreNetwork.ClientToServer.UseAbility.Server.OnClientEvent((clientId, req) => {
			const character = Player.FindByClientId(clientId)?.character;
			if (character) {
				const abilities = character.GetAbilities();
				abilities.UseAbilityById(req.abilityId);
			}
		});

		CoreNetwork.ClientToServer.GetAbilities.Server.SetCallback((clientId) => {
			const character = Player.FindByClientId(clientId)?.character;
			if (character) {
				const abilities = character.GetAbilities();
				return abilities.Encode();
			}

			return [];
		});

		// Handle cancellation on damage recieved
		CoreServerSignals.EntityDamage.ConnectWithPriority(SignalPriority.LOWEST, (event) => {
			if (event.IsCancelled()) return;

			const entity = event.entity;
			if (!(entity instanceof CharacterEntity)) return;

			// check if we have a charging ability
			const abilities = entity.GetAbilities();
			const castingAbility = abilities.GetChargingAbility();
			if (!castingAbility) return;

			// If we can cancel a charging ability by damage, then cancel it
			if (castingAbility.cancellationTriggers.has(AbilityCancellationTrigger.EntityDamageTaken)) {
				abilities.CancelChargingAbility();
			}
		});

		// Cancel on death regardless
		CoreServerSignals.EntityDeath.Connect((event) => {
			const entity = event.entity;
			if (!(entity instanceof CharacterEntity)) return;

			const abilities = entity.GetAbilities();
			const castingAbility = abilities.GetChargingAbility();
			if (!castingAbility) return;

			abilities.CancelChargingAbility();
		});
	}
}
