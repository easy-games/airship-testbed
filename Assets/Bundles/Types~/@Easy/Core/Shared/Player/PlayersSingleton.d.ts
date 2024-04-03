import { OnStart } from "../Flamework";
import { Signal, SignalPriority } from "../Util/Signal";
import { Player } from "./Player";
export declare class PlayersSingleton implements OnStart {
    onPlayerJoined: Signal<Player>;
    onPlayerDisconnected: Signal<Player>;
    joinMessagesEnabled: boolean;
    disconnectMessagesEnabled: boolean;
    private players;
    private playerManagerBridge;
    private server?;
    private playersPendingReady;
    private cachedProfilePictureTextures;
    private cachedProfilePictureSprite;
    private outfitFetchTime;
    constructor();
    OnStart(): void;
    private InitClient;
    private InitServer;
    private FetchEquippedOutfit;
    private HandlePlayerReadyServer;
    private AddPlayerClient;
    AddBotPlayer(): void;
    GetPlayers(): Player[];
    /**
     * Observe every player entering/leaving the game. The returned function can be
     * called to stop observing.
     *
     * The `observer` function is fired for every player currently in the game and
     * every future player that joins. The `observer` function must return another
     * function which is called when said player leaves (_or_ the top-level observer
     * function was called to stop the observation process).
     *
     * ```ts
     * Airship.players.ObservePlayers((player) => {
     * 	print(`${player.name} entered`);
     * 	return () => {
     * 		print(`${player.name} left`);
     * 	};
     * });
     * ```
     */
    ObservePlayers(observer: (player: Player) => (() => void) | void, signalPriority?: SignalPriority): () => void;
    /**
     * Looks for a player using a case insensitive fuzzy search
     *
     * Specific players can be grabbed using the full discriminator as well - e.g. `Luke#0001` would be a specific player
     * @param searchName The name of the plaeyr
     */
    FindByFuzzySearch(searchName: string): Player | undefined;
    FindByClientId(clientId: number): Player | undefined;
    /** Special method used for startup handshake. */
    FindByClientIdIncludePending(clientId: number): Player | undefined;
    FindByUserId(userId: string): Player | undefined;
    FindByUsername(name: string): Player | undefined;
    /**
     * **MAY YIELD**
     * @param userId
     * @returns
     */
    private pictureIndex;
    GetProfilePictureTextureAsync(userId: string): Texture2D | undefined;
    /**
     * **MAY YIELD**
     * @param userId
     * @returns
     */
    GetProfilePictureSpriteAsync(userId: string): Sprite | undefined;
}
