import { OnStart } from "../../../Shared/Flamework";
export declare class GroundItemController implements OnStart {
    private groundItemPrefab;
    private fallbackDisplayObj;
    private groundItems;
    private itemTypeToDisplayObjMap;
    private readonly groundItemsFolder;
    constructor();
    private CreateDisplayGO;
    OnStart(): void;
}
