export declare class PrefabBlockManager {
    private static instance;
    static Get(): PrefabBlockManager;
    private objectMap;
    constructor();
    GetBlockGameObject(pos: Vector3): GameObject | undefined;
    private OnBlockPlace;
    private OnBlockDestroy;
}
