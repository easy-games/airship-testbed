import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Network } from "Shared/Network";

@Controller({})
export class StatusEffectController implements OnStart {
	OnStart(): void {
		Network.ServerToClient.StatusEffectAdded.Client.OnServerEvent((clientId, statusEffectType, tier) => {
			ClientSignals.StatusEffectAdded.Fire(clientId, statusEffectType, tier);
		});
		Network.ServerToClient.StatusEffectRemoved.Client.OnServerEvent((clientId, statusEffectType) => {
			ClientSignals.StatusEffectRemoved.Fire(clientId, statusEffectType);
		});
	}
}
