import { BlockHitDamageFunc } from "./BlockHitDamageFunc";
import { World } from "./World";
export declare class WorldAPI {
    private static world;
    static DefaultVoxelHealth: number;
    static ChildVoxelId: number;
    static GetMainWorld(): World;
    static BlockHitDamageFunc: BlockHitDamageFunc;
    static GetVoxelPosition(worldPosition: Vector3): Vector3;
}
