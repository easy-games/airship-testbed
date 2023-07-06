import { Entity } from "Shared/Entity/Entity";

export class EntitySpawnClientEvent {
	constructor(public readonly Entity: Entity) {}
}
