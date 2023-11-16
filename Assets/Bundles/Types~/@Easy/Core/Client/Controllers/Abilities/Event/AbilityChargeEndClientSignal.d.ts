import { ChargingAbilityEndedDto } from "../../../../Shared/Abilities/Ability";
import { CharacterEntity } from "../../../../Shared/Entity/Character/CharacterEntity";
export declare class AbilityChargeEndClientSignal {
    readonly characterEntity: CharacterEntity;
    readonly chargingAbility: ChargingAbilityEndedDto;
    constructor(characterEntity: CharacterEntity, chargingAbility: ChargingAbilityEndedDto);
    IsLocalPlayer(): boolean;
}
