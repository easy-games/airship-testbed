import { ChatCommand } from "../../../../Shared/Commands/ChatCommand";
import { Player } from "../../../../Shared/Player/Player";
import { Ability } from "../../../../Shared/Strollers/Abilities/AbilityRegistry";
declare abstract class AbilityChatCommand extends ChatCommand {
    /**
     * Returns ability meta for provided ability from registry, if it exists.
     *
     * @param requestAbilityId The ability Id.
     * @returns The ability meta from ability registry, if it exists.
     */
    FindAbilityByIdCaseInsensitive(requestAbilityId: string): Ability | undefined;
}
export declare class AddAbilityCommand extends AbilityChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
export declare class RemoveAbilityCommand extends AbilityChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
export declare class AbilityEnableStateCommand extends AbilityChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
export {};
