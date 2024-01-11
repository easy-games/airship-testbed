/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CharacterEntity } from "../../../Shared/Entity/Character/CharacterEntity";
import { Entity } from "../../../Shared/Entity/Entity";
import { EntityPrefabType } from "../../../Shared/Entity/EntityPrefabType";
import { Player } from "../../../Shared/Player/Player";
import { ChatService } from "../Chat/ChatService";
import { InventoryService } from "../Inventory/InventoryService";
export declare class EntityService implements OnStart {
    private readonly invService;
    private readonly chatService;
    private idCounter;
    private entities;
    private loadedEntityPrefabs;
    private airshipPool;
    constructor(invService: InventoryService, chatService: ChatService);
    PreLoadHumanEntities(amount: number): void;
    OnStart(): void;
    GetEntityPrefab(entityPrefabType: EntityPrefabType): NetworkObject;
    SpawnEntity(entityPrefabType: EntityPrefabType, pos?: Vector3, rotation?: Quaternion): CharacterEntity;
    SpawnPlayerEntity(player: Player, entityPrefabType: EntityPrefabType, pos?: Vector3, rotation?: Quaternion): CharacterEntity;
    private SpawnEntityInternal;
    DespawnEntity(entity: Entity): void;
    GetEntityById(entityId: number): Entity | undefined;
    GetEntityByClientId(clientId: number): Entity | undefined;
    GetEntities(): Entity[];
}
