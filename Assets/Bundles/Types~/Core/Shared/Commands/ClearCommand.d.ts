import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";
export declare class ClearCommand extends ChatCommand {
    constructor();
    Execute(player: Player, args: string[]): void;
}
