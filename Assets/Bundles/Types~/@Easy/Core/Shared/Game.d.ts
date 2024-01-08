import { CoreContext } from "./CoreClientContext";
import { Player } from "./Player/Player";
import { Signal } from "./Util/Signal";
export declare class Game {
    static localPlayer: Player;
    static localPlayerLoaded: boolean;
    static onLocalPlayerLoaded: Signal<void>;
    static WaitForLocalPlayerLoaded(): void;
    static BroadcastMessage(message: string): void;
    static context: CoreContext;
    static serverId: string;
    static gameId: string;
    static startingScene: string;
}
