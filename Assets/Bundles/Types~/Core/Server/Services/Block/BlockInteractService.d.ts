/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "@easy-games/flamework-core";
import { Entity } from "../../../Shared/Entity/Entity";
import { AOEDamageMeta, BreakBlockMeta } from "../../../Shared/Item/ItemMeta";
import { DamageMeta } from "../Damage/DamageService";
import { EntityService } from "../Entity/EntityService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
export declare class BlockInteractService implements OnStart {
    private readonly invService;
    private readonly entityService;
    private readonly playerService;
    constructor(invService: InventoryService, entityService: EntityService, playerService: PlayerService);
    OnStart(): void;
    DamageBlock(entity: Entity, breakBlockMeta: BreakBlockMeta, voxelPos: Vector3): boolean;
    DamageBlockAOE(entity: Entity, centerPosition: Vector3, breakblockMeta: BreakBlockMeta, aoeMeta: AOEDamageMeta, config: DamageMeta): void;
}
