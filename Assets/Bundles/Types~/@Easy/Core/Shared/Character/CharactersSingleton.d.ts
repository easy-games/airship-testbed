/// <reference types="compiler-types" />
import { OnStart } from "../Flamework";
import { Player } from "../Player/Player";
import { Signal, SignalPriority } from "../Util/Signal";
import { CharacterItemManager } from "../Item/HeldItems/CharacterItemManager";
import Character from "./Character";
import { CustomMoveData } from "./CustomMoveData";
import { AirshipCharacterFootstepsSingleton } from "./Footstep/AirshipCharacterFootstepsSingleton";
import { LocalCharacterSingleton } from "./LocalCharacter/LocalCharacterSingleton";
export declare class CharactersSingleton implements OnStart {
    readonly localCharacterManager: LocalCharacterSingleton;
    readonly footsteps: AirshipCharacterFootstepsSingleton;
    private characters;
    onCharacterSpawned: Signal<Character>;
    onCharacterDespawned: Signal<Character>;
    itemManager: CharacterItemManager;
    /**
     * **SERVER ONLY**
     *
     * [Advanced]
     *
     * Custom data that the client sends in their move packet.
     */
    onServerCustomMoveCommand: Signal<CustomMoveData>;
    /**
     * If true, when a player disconnects their character will automatically be despawned.
     */
    autoDespawnCharactersOnPlayerDisconnect: boolean;
    allowMidGameOutfitChanges: boolean;
    private idCounter;
    private customCharacterTemplate?;
    constructor(localCharacterManager: LocalCharacterSingleton, footsteps: AirshipCharacterFootstepsSingleton);
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
    private InitCharacter;
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
    SetDefaultCharacterPrefab(prefabTemplate: GameObject | undefined): void;
    GetDefaultCharacterTemplate(): GameObject;
}
