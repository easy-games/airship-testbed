import { AbilityDto } from "../../../../Shared/Abilities/Ability";
import { CharacterEntity } from "../../../../Shared/Entity/Character/CharacterEntity";
export declare class AbilityRemovedClientSignal {
    readonly characterEntity: CharacterEntity;
    readonly ability: AbilityDto;
    constructor(characterEntity: CharacterEntity, ability: AbilityDto);
    IsLocalPlayer(): boolean;
}
