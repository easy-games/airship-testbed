import { CharacterEntity } from "../../../../Shared/Entity/Character/CharacterEntity";
export declare class AbilityRemovedClientSignal {
    readonly characterEntity: CharacterEntity;
    readonly abilityId: string;
    constructor(characterEntity: CharacterEntity, abilityId: string);
    IsLocalPlayer(): boolean;
}
