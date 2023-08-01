import { Entity } from "Shared/Entity/Entity";

export class EntitySpawnEvent {
	constructor(public readonly entity: Entity) {}
}
