import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";

@Controller({})
export class AbilityController implements OnStart {
	OnStart(): void {
		CoreClientSignals.LocalAbilityUseRequest.Connect((event) => {
			print(`Local ability use request! ${event.abilityId}`);
		});
	}
}
