/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../Flamework";
import { Player } from "../Player/Player";
import { Signal, SignalPriority } from "../Util/Signal";
import Character from "./Character";
import { CustomMoveData } from "./CustomMoveData";
import { LocalCharacterSingleton } from "./LocalCharacter/LocalCharacterSingleton";
export declare class CharactersSingleton implements OnStart {
    readonly localCharacterManager: LocalCharacterSingleton;
    private characters;
    onCharacterSpawned: Signal<Character>;
    onCharacterDespawned: Signal<Character>;
    /**
     * **SERVER ONLY**
     *
     * [Advanced]
     *
     * Custom data that the client sends in their move packet.
     */
    onServerCustomMoveCommand: Signal<CustomMoveData<unknown, unknown>>;
    /**
     * If true, when a player disconnects their character will automatically be despawned.
     */
    autoDespawnCharactersOnPlayerDisconnect: boolean;
    private idCounter;
    constructor(localCharacterManager: LocalCharacterSingleton);
    OnStart(): void;
    /**
     * Observe every character in the game. The returned function can be
     * called to stop observing.
     *
     * The `observer` function is fired for every character currently in the game and
     * every future character that spawns. The `observer` function must return another
     * function which is called when said character despawned (_or_ the top-level observer
     * function was called to stop the observation process).
     *
     * ```ts
     * Airship.characters.ObserveCharacters((character) => {
     *      character.SetMaxHealth(500);
     * });
     * ```
     */
    ObserveCharacters(observer: (character: Character) => (() => void) | void, signalPriority?: SignalPriority): () => void;
    SpawnNonPlayerCharacter(position: Vector3): Character;
    FindById(characterId: number): Character | undefined;
    FindByPlayer(player: Player): Character | undefined;
    FindByClientId(clientId: number): Character | undefined;
    FindByCollider(collider: Collider): Character | undefined;
    /**
     * Internal method for spawning a character.
     * @param character
     */
    RegisterCharacter(character: Character): void;
    UnregisterCharacter(character: Character): void;
    GetCharacters(): Set<Character>;
    MakeNewId(): number;
}
