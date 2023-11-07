import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Player } from "Shared/Player/Player";

@Service()
export class AbilitiesService implements OnStart {
	public OnStart(): void {
		CoreNetwork.ClientToServer.UseAbility.Server.OnClientEvent((clientId, req) => {
			const character = Player.FindByClientId(clientId)?.Character;
			if (character) {
				const abilities = character.GetAbilities();
				abilities.UseAbilityById(req.abilityId);
			}

			print("use ability", req.abilityId, "from client", clientId);
		});

		CoreNetwork.ClientToServer.GetAbilities.Server.SetCallback((clientId) => {
			const character = Player.FindByClientId(clientId)?.Character;
			if (character) {
				const abilities = character.GetAbilities();
				return abilities.ToArrayDto();
			}

			return [];
		});
	}
}
