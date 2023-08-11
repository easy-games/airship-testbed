import { OnStart } from "@easy-games/flamework-core";
import { EntityService } from "../Entity/EntityService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
export declare class BlockInteractService implements OnStart {
    private readonly invService;
    private readonly entityService;
    private readonly playerService;
    constructor(invService: InventoryService, entityService: EntityService, playerService: PlayerService);
    OnStart(): void;
}
