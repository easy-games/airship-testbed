import Character from "../Character/Character";
import { ProfilePictureMeta } from "../ProfilePicture/ProfilePictureMeta";
import { OutfitDto } from "../Airship/Types/Outputs/PlatformInventory";
import { Team } from "../Team/Team";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
export interface PlayerDto {
    nobId: number;
    clientId: number;
    userId: string;
    username: string;
    usernameTag: string;
    teamId: string | undefined;
}
export declare class Player {
    /**
     * The GameObject representing the player.
     */
    readonly networkObject: NetworkObject;
    /**
     * Unique network ID for the player in the given server. This ID
     * is typically given to network requests as a way to identify the
     * player to/from the server.
     *
     * This is not a unique identifier for the player outside of the
     * server. For a completely unique ID, use `BWPlayer.clientId`
     * instead.
     */
    readonly clientId: number;
    /**
     * The player's unique ID. This is unique and unchanging per player.
     *
     * This should _not_ be used in network requests to identify the
     * player. Use `clientId` for network requests.
     */
    userId: string;
    /**
     * The player's username. Non-unique, unless combined with `usernameTag`.
     */
    username: string;
    /**
     * @deprecated Username tags will be removed.
     *
     * The player's username tag. Append this value onto `username` for a
     * unique username.
     * ```ts
     * const uniqueName = `${player.username}#${player.usernameTag}`;
     * ```
     */
    usernameTag: string;
    /**
     * The player controls this entity.
     */
    character: Character | undefined;
    /** Fired when the player's character changes. */
    readonly onCharacterChanged: Signal<Character | undefined>;
    /**
     * Fired when the player disconnects from the server.
     * Connections will automatically be disconnected when the player leaves.
     */
    readonly onLeave: Signal<void>;
    private team;
    readonly onChangeTeam: Signal<[team: Team | undefined, oldTeam: Team | undefined]>;
    onUsernameChanged: Signal<[username: string]>;
    private profilePicture;
    private bin;
    private connected;
    selectedOutfit: OutfitDto | undefined;
    outfitLoaded: boolean;
    constructor(
    /**
     * The GameObject representing the player.
     */
    networkObject: NetworkObject, 
    /**
     * Unique network ID for the player in the given server. This ID
     * is typically given to network requests as a way to identify the
     * player to/from the server.
     *
     * This is not a unique identifier for the player outside of the
     * server. For a completely unique ID, use `BWPlayer.clientId`
     * instead.
     */
    clientId: number, 
    /**
     * The player's unique ID. This is unique and unchanging per player.
     *
     * This should _not_ be used in network requests to identify the
     * player. Use `clientId` for network requests.
     */
    userId: string, 
    /**
     * The player's username. Non-unique, unless combined with `usernameTag`.
     */
    username: string, 
    /**
     * @deprecated Username tags will be removed.
     *
     * The player's username tag. Append this value onto `username` for a
     * unique username.
     * ```ts
     * const uniqueName = `${player.username}#${player.usernameTag}`;
     * ```
     */
    usernameTag: string);
    /**
     * Can yield if the player's outfit hasn't finished downloading.
     * @param position
     * @param config
     * @returns
     */
    SpawnCharacter(position: Vector3, config?: {
        lookDirection?: Vector3;
        /**
         * If true, method does not yield if the player's outfit hasn't been downloaded.
         *
         * This can cause characters to spawn with no outfit.
         */
        noOutfitYield?: boolean;
    }): Character;
    WaitForOutfitLoaded(timeout?: number): void;
    GetProfilePicture(): ProfilePictureMeta;
    SetTeam(team: Team): void;
    GetTeam(): Team | undefined;
    UpdateUsername(username: string): void;
    SendMessage(message: string, sender?: Player): void;
    /** Is player friends with the local player? */
    IsFriend(): boolean;
    IsBot(): boolean;
    Encode(): PlayerDto;
    SetCharacter(character: Character | undefined): void;
    ObserveCharacter(observer: (entity: Character | undefined) => CleanupFunc): Bin;
    IsLocalPlayer(): boolean;
    /**
     * Is the player connected to the server?
     */
    IsConnected(): boolean;
    Destroy(): void;
}
