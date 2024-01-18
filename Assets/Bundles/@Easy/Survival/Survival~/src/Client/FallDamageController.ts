import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { Controller, OnStart } from "@easy-games/flamework-core";

@Controller({})
export class FallDamageController implements OnStart {
	OnStart(): void {
		CoreClientSignals.EntitySpawn.Connect((event) => {
			event.entity.entityDriver.OnImpactWithGround((velocity) => {
				event.entity.animator?.PlayFootstepSound(1.4);
			});
		});
	}
}
