/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Block } from "Shared/VoxelWorld/Block";
export declare class BeforeBlockHitSignal {
    readonly blockPos: Vector3;
    readonly block: Block;
    constructor(blockPos: Vector3, block: Block);
}
