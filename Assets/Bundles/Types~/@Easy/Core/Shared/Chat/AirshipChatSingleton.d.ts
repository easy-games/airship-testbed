import { OnStart } from "../Flamework";
import { ChatCommand } from "../Commands/ChatCommand";
export declare class AirshipChatSingleton implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Sets chat's visibility.
     *
     * @param val Whether or not chat should be visible.
     */
    SetUIEnabled(val: boolean): void;
    /**
     * Registers provided command.
     *
     * @param command A command instance.
     */
    RegisterCommand(command: ChatCommand): void;
    /**
     * Broadcasts message to entire server, if called from server. Otherwise,
     * broadcasts message to only local player.
     *
     * @param message A message.
     */
    BroadcastMessage(message: string): void;
}
