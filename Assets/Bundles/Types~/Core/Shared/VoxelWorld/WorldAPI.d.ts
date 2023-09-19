/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BlockHitDamageFunc } from "./BlockHitDamageFunc";
import { World } from "./World";
export declare class WorldAPI {
    private static world;
    static DefaultVoxelHealth: number;
    static ChildVoxelId: number;
    static GetMainWorld(): World | undefined;
    static GetVoxelPosition(worldPosition: Vector3): Vector3;
    static BlockHitDamageFunc: BlockHitDamageFunc;
    static GetVoxelPosition(worldPosition: Vector3): Vector3;
}
