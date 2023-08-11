import { Entity } from "Shared/Entity/Entity";

export class EntitySpawnClientSignal {
	constructor(public readonly entity: Entity) {}
}
