import { OnStart, Service } from "@Easy/Core/Shared/Flamework";

@Service({})
export class FallDamageService implements OnStart {
	OnStart(): void {
		// CoreServerSignals.EntitySpawn.Connect((event) => {
		// 	event.entity.entityDriver.OnImpactWithGround((velocity) => {
		// 		const result = Dependency<DamageService>().InflictFallDamage(event.entity, velocity.y);
		// 		if (result) {
		// 			CoreNetwork.ServerToClient.Entity.FallDamageTaken.server.FireAllClients(event.entity.id, velocity);
		// 		}
		// 	});
		// });
	}
}
