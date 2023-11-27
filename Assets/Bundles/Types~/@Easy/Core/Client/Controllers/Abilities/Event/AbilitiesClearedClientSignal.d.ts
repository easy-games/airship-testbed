import { CharacterEntity } from "../../../../Shared/Entity/Character/CharacterEntity";
export declare class AbilitiesClearedClientSignal {
    readonly characterEntity: CharacterEntity;
    constructor(characterEntity: CharacterEntity);
    IsLocalPlayer(): boolean;
}
