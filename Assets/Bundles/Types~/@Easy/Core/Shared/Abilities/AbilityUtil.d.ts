import { AbilityDto } from "./Ability";
export declare class AbilityUtil {
    /**
     * Creates an ability data transfer object based on ability id and enabled state.
     *
     * @param abilityId The ability's id.
     * @param enabled Whether or not the ability is _currently_ enabled.
     */
    static CreateAbilityDto(abilityId: string, enabled: boolean): AbilityDto | undefined;
}
