/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Entity } from "../../../Shared/Entity/Entity";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
import { LocalEntityController } from "../Character/LocalEntityController";
import { InventoryController } from "../Inventory/InventoryController";
export declare class EntityController implements OnStart {
    private readonly invController;
    private readonly localEntityController;
    private readonly abilityRegistry;
    private entities;
    entityHealthbarPrefab: Object;
    constructor(invController: InventoryController, localEntityController: LocalEntityController, abilityRegistry: AbilityRegistry);
    OnStart(): void;
    private DespawnEntity;
    private AddEntity;
    GetEntityById(entityId: number): Entity | undefined;
    WaitForId(entityId: number): Promise<Entity | undefined>;
    GetEntityByClientId(clientId: number): Entity | undefined;
    GetEntityByPlayerId(playerId: number): Entity | undefined;
    /** Yields until entity that corresponds to `playerId` exists. */
    WaitForEntityByPlayerId(playerId: number): Entity;
    GetEntities(): Entity[];
}
