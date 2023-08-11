import { HeldItem } from "../HeldItem";
export declare class BlockHeldItem extends HeldItem {
    private characterLayerMask;
    OnEquip(): void;
    OnUnEquip(): void;
    OnUseClient(useIndex: number): void;
    private TryPlaceBlock;
}
