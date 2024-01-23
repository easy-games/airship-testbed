import { Outfit } from "./AvatarPlatformAPI";
export declare class AvatarUtil {
    static readonly defaultAccessoryOutfitPath = "@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
    private static readonly allAvatarAccessories;
    private static readonly ownedAvatarAccessories;
    private static readonly avatarSkinAccessories;
    static defaultOutfit: AccessoryOutfit | undefined;
    static readonly skinColors: Color[];
    static Initialize(): void;
    static GetOwnedAccessories(): void;
    static AddAvailableAvatarItem(item: AccessoryComponent): void;
    static GetAllAvatarItems(slotType: AccessorySlot): AccessoryComponent[] | undefined;
    static GetAllAvatarSkins(): AccessorySkin[];
    static GetAccessoryFromClassId(classId: string): AccessoryComponent | undefined;
    static LoadEquippedUserOutfit(builder: AccessoryBuilder, options?: {
        keepOldAccessories?: boolean;
        combineMeshes?: boolean;
    }): void;
    static LoadDefaultOutfit(builder: AccessoryBuilder): void;
    static LoadUserOutfit(outfit: Outfit, builder: AccessoryBuilder, options?: {
        keepOldAccessories?: boolean;
    }): void;
}
