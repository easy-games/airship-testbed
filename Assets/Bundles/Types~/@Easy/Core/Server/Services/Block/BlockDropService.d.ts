import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { GroundItemService } from "../GroundItem/GroundItemService";
export declare class BlockDropService implements OnStart {
    private readonly groundItemService;
    constructor(groundItemService: GroundItemService);
    OnStart(): void;
}
