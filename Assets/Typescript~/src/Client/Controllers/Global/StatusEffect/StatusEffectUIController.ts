import { Game } from "@Easy/Core/Shared/Game";
import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";

@Controller({})
export class StatusEffectUIController implements OnStart {
	OnStart(): void {
		ClientSignals.StatusEffectAdded.Connect((clientId, statusEffectType, tier) => {
			if (clientId === Game.LocalPlayer.clientId) {
				// Do things!
			}
		});
		ClientSignals.StatusEffectRemoved.Connect((clientId, statusEffectType) => {
			if (clientId === Game.LocalPlayer.clientId) {
				// Do things!
			}
		});
	}
}
