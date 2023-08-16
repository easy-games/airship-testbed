import { Player } from "../Player/Player";
import { ChatCommand } from "./ChatCommand";
export declare class UserCommand extends ChatCommand {
    private usageString;
    constructor();
    Execute(player: Player, args: string[]): void;
}
