/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "../../../Entity/Entity";
import { Cancellable } from "../../../Util/Cancellable";
import { Signal } from "../../../Util/Signal";
import { Block } from "../../../VoxelWorld/Block";
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";
declare class CanUseBlockSignal extends Cancellable {
    readonly block: Block;
    readonly blockPos: Vector3;
    readonly entity: Entity;
    constructor(block: Block, blockPos: Vector3, entity: Entity);
}
export declare class BreakBlockHeldItem extends BlockSelectHeldItem {
    static CanUseBlockSignal: Signal<CanUseBlockSignal>;
    OnEquip(): void;
    OnUseClient(useIndex: number): void;
    private HitBlockLocal;
    CanUseBlock(selectedPos: Vector3 | undefined, placedPos: Vector3 | undefined, highlightedPos: Vector3 | undefined): boolean;
}
export {};
