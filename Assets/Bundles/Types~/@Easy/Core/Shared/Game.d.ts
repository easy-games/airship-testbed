import { CoreContext } from "./CoreClientContext";
import { Player } from "./Player/Player";
export declare class Game {
    static localPlayer: Player;
    static BroadcastMessage(message: string): void;
    static context: CoreContext;
    static serverId: string;
    static gameId: string;
    static startingScene: string;
}
