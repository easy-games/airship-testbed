import { Entity } from "Imports/Core/Shared/Entity/Entity";

export class EntitySpawnClientEvent {
	constructor(public readonly entity: Entity) {}
}
