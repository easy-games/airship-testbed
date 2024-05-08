import { ChatCommand } from "../../../../Commands/ChatCommand";
import { Player } from "../../../../Player/Player";
export declare class MessageCommand extends ChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
