import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { EntityService } from "../Entity/EntityService";
import { PlayerService } from "../Player/PlayerService";
export declare class MapEditService implements OnStart {
    private readonly playerService;
    private readonly entityService;
    private spawnPos;
    constructor(playerService: PlayerService, entityService: EntityService);
    OnStart(): void;
    private LoadWorld;
}
