import { CharacterEntity } from "../../../../Shared/Entity/Character/CharacterEntity";
export declare class AbilityStateUpdateSignal {
    readonly characterEntity: CharacterEntity;
    readonly abilityId: string;
    readonly enabled: boolean;
    constructor(characterEntity: CharacterEntity, abilityId: string, enabled: boolean);
    IsLocalPlayer(): boolean;
}
