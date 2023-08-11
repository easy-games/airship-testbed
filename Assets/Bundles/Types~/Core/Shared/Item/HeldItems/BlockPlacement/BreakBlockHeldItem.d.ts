import { HeldItem } from "../HeldItem";
export declare class BreakBlockHeldItem extends HeldItem {
    OnEquip(): void;
    OnUnEquip(): void;
    OnUseClient(useIndex: number): void;
    private HitBlockLocal;
}
