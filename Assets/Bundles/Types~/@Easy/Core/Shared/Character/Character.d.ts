/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
import { CharacterAnimator } from "./Animation/CharacterAnimator";
import Inventory from "../Inventory/Inventory";
import { Player } from "../Player/Player";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
export default class Character extends AirshipBehaviour {
    player?: Player;
    animator: CharacterAnimator;
    movement: CharacterMovement;
    animationHelper: CharacterAnimationHelper;
    accessoryBuilder: AccessoryBuilder;
    model: GameObject;
    networkObject: NetworkObject;
    rig: GameObject;
    headBone: GameObject;
    chestBone: GameObject;
    id: number;
    state: CharacterState;
    private health;
    private maxHealth;
    /** A bin that is cleaned when the entity despawns. */
    readonly bin: Bin;
    inventory: Inventory;
    onDeath: Signal<void>;
    onDespawn: Signal<void>;
    onStateChanged: Signal<[newState: CharacterState, oldState: CharacterState]>;
    onHealthChanged: Signal<[newHealth: number, oldHealth: number]>;
    Awake(): void;
    Start(): void;
    Init(player: Player | undefined, id: number): void;
    Teleport(pos: Vector3, lookDirection?: Vector3): void;
    OnDisable(): void;
    IsDestroyed(): boolean;
    IsAlive(): boolean;
    IsDead(): boolean;
    GetHealth(): number;
    SetHealth(health: number): void;
    GetMaxHealth(): number;
    SetMaxHealth(maxHealth: number): void;
    IsLocalCharacter(): boolean;
}
