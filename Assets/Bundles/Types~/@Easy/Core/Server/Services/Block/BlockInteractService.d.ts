/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CharacterEntity } from "../../../Shared/Entity/Character/CharacterEntity";
import { Entity } from "../../../Shared/Entity/Entity";
import { AOEDamageDef, BlockDamageType, BreakBlockDef, ItemDef, TillBlockDef } from "../../../Shared/Item/ItemDefinitionTypes";
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
    PlaceBlock(entity: CharacterEntity, pos: Vector3, item: ItemDef, blockData?: BlockData): void;
    PlaceBlockGroup(entity: CharacterEntity, positions: Vector3[], items: ItemDef[]): void;
    TillBlock(entity: Entity | undefined, tillBlockMeta: TillBlockDef, voxelPos: Vector3): boolean;
    DamageBlock(entity: Entity | undefined, breakBlockMeta: BreakBlockDef, voxelPos: Vector3): boolean;
    DamageBlocks(entity: Entity | undefined, damageType: BlockDamageType, voxelPositions: Vector3[], damages: number[]): boolean;
    private SendDamageEvents;
    DamageBlockAOE(entity: Entity | undefined, centerPosition: Vector3, aoeMeta: AOEDamageDef): void;
    DamageBlockAOESimple(entity: Entity, centerPosition: Vector3, aoeMeta: AOEDamageDef): void;
    private GetMaxAOEDamage;
}
