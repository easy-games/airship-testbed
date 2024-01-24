/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../node_modules/@easy-games/flamework-core";
import { Player } from "../Player/Player";
import { Signal } from "../Util/Signal";
import Character from "./Character";
import { CustomMoveData } from "./CustomMoveData";
export declare class CharactersSingleton implements OnStart {
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
    constructor();
    OnStart(): void;
    FindById(characterId: number): Character | undefined;
    FindByPlayer(player: Player): Character | undefined;
    FindByClientId(clientId: number): Character | undefined;
    FindByCollider(collider: Collider): Character | undefined;
    RegisterCharacter(character: Character): void;
    UnregisterCharacter(character: Character): void;
    GetCharacters(): Set<Character>;
}
