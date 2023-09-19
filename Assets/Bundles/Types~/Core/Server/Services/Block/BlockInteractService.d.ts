/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "@easy-games/flamework-core";
import { Entity } from "../../../Shared/Entity/Entity";
import { AOEDamageMeta, BreakBlockMeta } from "../../../Shared/Item/ItemMeta";
import { DamageMeta } from "../Damage/DamageService";
import { EntityService } from "../Entity/EntityService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
import { CharacterEntity } from "Imports/Core/Shared/Entity/Character/CharacterEntity";
import { BreakBlockMeta, ItemMeta } from "Imports/Core/Shared/Item/ItemMeta";
import { Entity } from "Imports/Core/Shared/Entity/Entity";
export declare class BlockInteractService implements OnStart {
    private readonly invService;
    private readonly entityService;
    private readonly playerService;
    constructor(invService: InventoryService, entityService: EntityService, playerService: PlayerService);
    OnStart(): void;
	PlaceBlock(entity: CharacterEntity, pos: Vector3, item: ItemMeta): undefined;
	PlaceBlockGroup(entity: CharacterEntity, positions: Vector3[], items: ItemMeta[]): undefined;
    DamageBlock(entity: Entity, breakBlockMeta: BreakBlockMeta, voxelPos: Vector3): boolean;
}
