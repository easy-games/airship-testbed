import { OnStart } from "../../../node_modules/@easy-games/flamework-core";
import { Signal, SignalPriority } from "../Util/Signal";
import { Player } from "./Player";
export declare class PlayersSingleton implements OnStart {
    onPlayerJoined: Signal<Player>;
    onPlayerDisconnected: Signal<Player>;
    joinMessagesEnabled: boolean;
    private players;
    private playerManagerBridge;
    private server?;
    private playersPendingReady;
    constructor();
    OnStart(): void;
    private InitClient;
    private InitServer;
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
}
