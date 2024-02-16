import { CoreContext } from "./CoreClientContext";
import { GameData } from "./GameData";
import { Player } from "./Player/Player";
import { Signal } from "./Util/Signal";
export declare class Game {
    /**
     * The local client's player.
     *
     * On the server this is undefined.
     *
     * There is a brief moment on client startup when localPlayer is undefined.
     * You can listen for when the local player is loaded with {@link WaitForLocalPlayerLoaded}
     */
    static localPlayer: Player;
    static localPlayerLoaded: boolean;
    static onLocalPlayerLoaded: Signal<void>;
    static WaitForLocalPlayerLoaded(): void;
    static BroadcastMessage(message: string): void;
    static context: CoreContext;
    /**
     * Empty string when in editor.
     */
    static serverId: string;
    /**
     * While in editor, this will reflect whatever is defined in `Assets/GameConfig.asset`
     */
    static gameId: string;
    /**
     * Empty string when in editor.
     */
    static organizationId: string;
    static startingScene: string;
    static gameData: GameData | undefined;
    static onGameDataLoaded: Signal<GameData>;
    static WaitForGameData(): GameData;
}
