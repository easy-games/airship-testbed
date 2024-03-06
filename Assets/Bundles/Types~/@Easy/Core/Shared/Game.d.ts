import { GameDto } from "../Client/Components/HomePage/API/GamesAPI";
import { CoreContext } from "./CoreClientContext";
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
    static coreContext: CoreContext;
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
    static gameData: GameDto | undefined;
    static onGameDataLoaded: Signal<GameDto>;
    static WaitForGameData(): GameDto;
    /**
     * The platform of this device.
     *
     * To get a certain player's platform, use {@link Player.platform}
     */
    static platform: AirshipPlatform;
    static IsMobile(): boolean;
    static IsClient(): boolean;
    static IsServer(): boolean;
    static IsEditor(): boolean;
    /**
     * Shortcut for checking if both IsClient() and IsServer() is true.
     */
    static IsHosting(): boolean;
    static IsClone(): boolean;
    static IsWindows(): boolean;
    static IsMac(): boolean;
}
