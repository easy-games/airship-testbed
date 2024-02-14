import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class FallDamageController implements OnStart {
	OnStart(): void {
		// CoreClientSignals.EntitySpawn.Connect((event) => {
		// 	event.entity.entityDriver.OnImpactWithGround((velocity) => {
		// 		event.entity.animator?.PlayFootstepSound(1.4);
		// 	});
		// });
	}
}
