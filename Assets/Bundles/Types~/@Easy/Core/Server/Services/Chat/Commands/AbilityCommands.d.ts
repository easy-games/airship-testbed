import { ChatCommand } from "../../../../Shared/Commands/ChatCommand";
import { Player } from "../../../../Shared/Player/Player";
export declare class AddAbilityCommand extends ChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
export declare class RemoveAbilityCommand extends ChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
