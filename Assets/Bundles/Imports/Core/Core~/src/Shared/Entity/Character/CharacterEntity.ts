import { Inventory } from "Shared/Inventory/Inventory";
import { Entity, EntityDto } from "../Entity";
import { EntitySerializer } from "../EntitySerializer";

export interface CharacterEntityDto extends EntityDto {
	invId: number;
}

export class CharacterEntity extends Entity {
	private inventory: Inventory;

	constructor(id: number, networkObject: NetworkObject, clientId: number | undefined, inventory: Inventory) {
		super(id, networkObject, clientId);
		this.inventory = inventory;
	}

	public GetInventory(): Inventory {
		return this.inventory;
	}

	public Encode(): CharacterEntityDto {
		return {
			...super.Encode(),
			serializer: EntitySerializer.CHARACTER,
			invId: this.inventory.Id,
		};
	}
}
