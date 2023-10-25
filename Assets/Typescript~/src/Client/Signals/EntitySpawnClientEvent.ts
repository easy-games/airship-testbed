import { Entity } from "@Easy/Core/Shared/Entity/Entity";

export class EntitySpawnClientEvent {
	constructor(public readonly entity: Entity) {}
}
