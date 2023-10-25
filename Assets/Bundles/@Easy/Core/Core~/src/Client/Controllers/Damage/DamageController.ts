import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { EntityDamageClientSignal } from "Client/Signals/EntityDamageClientSignal";
import { EntityDeathClientSignal } from "Client/Signals/EntityDeathClientSignal";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Entity } from "Shared/Entity/Entity";
import { EntityController } from "../Entity/EntityController";

@Controller({})
export class DamageController implements OnStart {
	constructor(private readonly entityController: EntityController) {}

	OnStart(): void {
		CoreNetwork.ServerToClient.EntityDamage.Client.OnServerEvent((entityId, amount, damageType, fromEntityId) => {
			const entity = this.entityController.GetEntityById(entityId);
			if (!entity) {
				error("Failed to find entity.");
			}

			let fromEntity: Entity | undefined;
			if (fromEntityId !== undefined) {
				fromEntity = this.entityController.GetEntityById(fromEntityId);
			}

			CoreClientSignals.EntityDamage.Fire(new EntityDamageClientSignal(entity, amount, damageType, fromEntity));
		});

		CoreNetwork.ServerToClient.EntityDeath.Client.OnServerEvent(
			(entityId, damageType, fromEntityId, respawnTime) => {
				const entity = this.entityController.GetEntityById(entityId);
				if (!entity) {
					error("Failed to find entity.");
				}

				let fromEntity: Entity | undefined;
				if (fromEntityId !== undefined) {
					fromEntity = this.entityController.GetEntityById(fromEntityId);
				}

				entity.Kill();
				CoreClientSignals.EntityDeath.Fire(
					new EntityDeathClientSignal(entity, damageType, fromEntity, respawnTime),
				);
			},
		);
	}
}
