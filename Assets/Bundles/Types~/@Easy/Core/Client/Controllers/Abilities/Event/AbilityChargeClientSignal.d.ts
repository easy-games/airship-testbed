import { ChargingAbilityDto } from "../../../../Shared/Abilities/Ability";
import { CharacterEntity } from "../../../../Shared/Entity/Character/CharacterEntity";
export declare class AbilityChargeClientSignal {
    readonly characterEntity: CharacterEntity;
    readonly chargingAbility: ChargingAbilityDto;
    constructor(characterEntity: CharacterEntity, chargingAbility: ChargingAbilityDto);
    IsLocalPlayer(): boolean;
}
