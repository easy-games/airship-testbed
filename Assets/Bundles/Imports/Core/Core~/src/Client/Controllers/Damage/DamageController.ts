import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { EntityDamageClientSignal } from "Client/Signals/EntityDamageClientSignal";
import { EntityDeathClientSignal } from "Client/Signals/EntityDeathClientSignal";
import { Entity } from "Shared/Entity/Entity";
import { CoreNetwork } from "Shared/Network";
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

			ClientSignals.EntityDamage.Fire(new EntityDamageClientSignal(entity, amount, damageType, fromEntity));
		});

		CoreNetwork.ServerToClient.EntityDeath.Client.OnServerEvent((entityId, damageType, fromEntityId) => {
			const entity = this.entityController.GetEntityById(entityId);
			if (!entity) {
				error("Failed to find entity.");
			}

			let fromEntity: Entity | undefined;
			if (fromEntityId !== undefined) {
				fromEntity = this.entityController.GetEntityById(fromEntityId);
			}

			entity.Kill();
			ClientSignals.EntityDeath.Fire(new EntityDeathClientSignal(entity, damageType, fromEntity));
		});
	}
}
