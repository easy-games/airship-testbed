/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";
export declare class TillBlockHeldItem extends BlockSelectHeldItem {
    OnEquip(): void;
    OnUseClient(useIndex: number): void;
    private HitBlockLocal;
    CanUseBlock(selectedPos: Vector3 | undefined, placedPos: Vector3 | undefined, highlightedPos: Vector3 | undefined): boolean;
}
