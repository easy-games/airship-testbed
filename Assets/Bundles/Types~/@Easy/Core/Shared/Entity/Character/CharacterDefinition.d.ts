import { AccessoryType } from "./Accessory/AccessoryType";
import { BaseCharacters } from "./BaseCharacters";
export interface CharacterDefinition {
    BaseCharacter: keyof typeof BaseCharacters;
    Accessories: AccessoryType[];
}
