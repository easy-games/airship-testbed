/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Player } from "../../../Shared/Player/Player";
import { Signal, SignalPriority } from "../../../Shared/Util/Signal";
export declare class PlayerService implements OnStart {
    /** Fires when a player first connects to the server. */
    readonly playerPreReady: Signal<[player: Player]>;
    readonly playerAdded: Signal<[player: Player]>;
    /** Fires when a player is removed from the game. */
    readonly playerRemoved: Signal<[player: Player]>;
    private playerManager;
    private readonly players;
    private playersPendingReady;
    private botCounter;
    constructor();
    HandlePlayerReady(player: Player): void;
    /**
     * Looks for a player using a case insensitive fuzzy search
     *
     * Specific players can be grabbed using the full discriminator as well - e.g. `Luke#0001` would be a specific player
     * @param searchName The name of the plaeyr
     */
    FuzzyFindFirstPlayerByName(searchName: string): Player | undefined;
    AddBotPlayer(): void;
    /** Get all players. */
    GetPlayers(): Readonly<Array<Player>>;
    /** Attempt to retrieve a player by `clientId`. */
    GetPlayerFromClientId(clientId: number): Player | undefined;
    /** Attempt to retrieve a player by username. */
    GetPlayerFromUsername(name: string): Player | undefined;
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
     * playersService.ObservePlayers((player) => {
     * 	print(`${player.name} entered`);
     * 	return () => {
     * 		print(`${player.name} left`);
     * 	};
     * });
     * ```
     */
    ObservePlayers(observer: (player: Player) => (() => void) | void, signalPriority?: SignalPriority): () => void;
    OnStart(): void;
}
