import { Inventory } from "Shared/Inventory/Inventory";
import { Entity, EntityDto } from "../Entity";
export interface CharacterEntityDto extends EntityDto {
    invId: number;
}
export declare class CharacterEntity extends Entity {
    private inventory;
    constructor(id: number, networkObject: NetworkObject, clientId: number | undefined, inventory: Inventory);
    GetInventory(): Inventory;
    Encode(): CharacterEntityDto;
}
