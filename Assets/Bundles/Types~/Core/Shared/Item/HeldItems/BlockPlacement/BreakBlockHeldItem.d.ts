import { HeldItem } from "../HeldItem";
export declare class BreakBlockHeldItem extends HeldItem {
    private holdingDownBin;
    private holdingDown;
    OnEquip(): void;
    OnUnEquip(): void;
    OnUseClient(useIndex: number): void;
    OnCallToActionEnd(): void;
    private HitBlockLocal;
}
