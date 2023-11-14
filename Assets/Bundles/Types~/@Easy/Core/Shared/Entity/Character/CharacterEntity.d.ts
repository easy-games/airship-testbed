import { Inventory } from "../../Inventory/Inventory";
import { Entity, EntityDto } from "../Entity";
import { CharacterAbilities } from "../../Abilities/CharacterAbilities";
import { AbilityDto } from "../../Abilities/Ability";
import { Ability } from "../../Strollers/Abilities/AbilityRegistry";
export interface CharacterEntityDto extends EntityDto {
    invId: number;
    abilities: AbilityDto[];
}
export declare class CharacterEntity extends Entity {
    private inventory;
    private abilities;
    private armor;
    constructor(id: number, networkObject: NetworkObject, clientId: number | undefined, inventory: Inventory, abilities?: readonly Ability[]);
    IsMoving(): void;
    GetInventory(): Inventory;
    GetAbilities(): CharacterAbilities;
    Encode(): CharacterEntityDto;
    private CalcArmor;
    GetArmor(): number;
}
