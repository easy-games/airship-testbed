import { HeldItem } from "../HeldItem";
export declare class BreakBlockHeldItem extends HeldItem {
    private holdingDownId;
    private holdingDownBin;
    OnEquip(): void;
    OnUnEquip(): void;
    OnUseClient(useIndex: number): void;
    OnCallToActionEnd(): void;
    private HitBlockLocal;
}
