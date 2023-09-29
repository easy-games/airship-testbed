/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";
export declare class BreakBlockHeldItem extends BlockSelectHeldItem {
    private holdingDownBin;
    private holdingDown;
    OnEquip(): void;
    OnUnEquip(): void;
    OnUseClient(useIndex: number): void;
    OnCallToActionEnd(): void;
    private HitBlockLocal;
    CanUseBlock(selectedPos: Vector3 | undefined, placedPos: Vector3 | undefined, highlightedPos: Vector3 | undefined): boolean;
}
