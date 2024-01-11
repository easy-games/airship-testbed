/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { BlockSelectHeldItem } from "./BlockSelectHeldItem";
export declare class PlaceBlockHeldItem extends BlockSelectHeldItem {
    private characterLayerMask;
    private placementQueued;
    private dynamicBlock?;
    private dynamicBlockViewmodel?;
    OnEquip(): void;
    private GenerateBlock;
    OnUnEquip(): void;
    OnUseClient(useIndex: number): void;
    private TryPlaceBlock;
    CanUseBlock(selectedPos: Vector3 | undefined, placedPos: Vector3 | undefined, highlightedPos: Vector3 | undefined): boolean;
}
