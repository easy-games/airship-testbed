/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import Character from "../Character/Character";
import { BreakBlockDef } from "../Item/ItemDefinitionTypes";
import { Signal } from "../Util/Signal";
import { Block } from "./Block";
import { BlockHitDamageSignal } from "./Signal/BlockHitDamageSignal";
import { World } from "./World";
export declare class WorldAPI {
    private static world;
    static defaultVoxelHealth: number;
    static childVoxelId: number;
    static onBlockHitDamageCalc: Signal<BlockHitDamageSignal>;
    static GetMainWorld(): World | undefined;
    static GetVoxelPosition(worldPosition: Vector3): Vector3;
    static CalculateBlockHitDamage(character: Character | undefined, block: Block, blockPos: Vector3, breakBlockMeta: BreakBlockDef): number;
}
