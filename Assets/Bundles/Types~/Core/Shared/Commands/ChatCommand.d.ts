import { Player } from "../Player/Player";
export declare abstract class ChatCommand {
    commandLabel: string;
    aliases: string[];
    constructor(commandLabel: string, aliases?: string[]);
    abstract Execute(player: Player, args: string[]): void;
}
