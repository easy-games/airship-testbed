/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CharacterEntity } from "../../../Shared/Entity/Character/CharacterEntity";
import { Entity } from "../../../Shared/Entity/Entity";
import { AOEDamageMeta, BreakBlockMeta, ItemMeta, TillBlockMeta } from "../../../Shared/Item/ItemMeta";
import { BlockData } from "../../../Shared/VoxelWorld/World";
import { EntityService } from "../Entity/EntityService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
export declare class BlockInteractService implements OnStart {
    private readonly invService;
    private readonly entityService;
    private readonly playerService;
    constructor(invService: InventoryService, entityService: EntityService, playerService: PlayerService);
    OnStart(): void;
    PlaceBlock(entity: CharacterEntity, pos: Vector3, item: ItemMeta, blockData?: BlockData): void;
    PlaceBlockGroup(entity: CharacterEntity, positions: Vector3[], items: ItemMeta[]): void;
    TillBlock(entity: Entity | undefined, tillBlockMeta: TillBlockMeta, voxelPos: Vector3): boolean;
    DamageBlock(entity: Entity | undefined, breakBlockMeta: BreakBlockMeta, voxelPos: Vector3): boolean;
    DamageBlocks(entity: Entity | undefined, voxelPositions: Vector3[], damages: number[]): boolean;
    private SendDamageEvents;
    DamageBlockAOE(entity: Entity, centerPosition: Vector3, aoeMeta: AOEDamageMeta): void;
    DamageBlockAOESimple(entity: Entity, centerPosition: Vector3, aoeMeta: AOEDamageMeta): void;
    private GetMaxAOEDamage;
}
