import { Inventory } from "../../Inventory/Inventory";
import { Entity, EntityDto } from "../Entity";
import { CharacterAbilities } from "../../Abilities/CharacterAbilities";
export interface CharacterEntityDto extends EntityDto {
    invId: number;
}
export declare class CharacterEntity extends Entity {
    private inventory;
    private abilities;
    private armor;
    constructor(id: number, networkObject: NetworkObject, clientId: number | undefined, inventory: Inventory);
    GetInventory(): Inventory;
    GetAbilities(): CharacterAbilities;
    Encode(): CharacterEntityDto;
    private CalcArmor;
    GetArmor(): number;
}
