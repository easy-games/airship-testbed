import { ChatCommand } from "../../../../Shared/Commands/ChatCommand";
import { Player } from "../../../../Shared/Player/Player";
declare abstract class AbilityChatCommand extends ChatCommand {
    FindAbilityByIdCaseInsensitive(id: string): import("../../../../Shared/Strollers/Abilities/AbilityRegistry").Ability | undefined;
}
export declare class AddAbilityCommand extends AbilityChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
export declare class RemoveAbilityCommand extends AbilityChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
export {};
