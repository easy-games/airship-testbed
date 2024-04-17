/// <reference types="compiler-types" />
import { AccessoryClass, OutfitDto } from "../Airship/Types/Outputs/PlatformInventory";
export declare class AvatarUtil {
    private static readonly allAvatarAccessories;
    private static readonly allAvatarFaces;
    private static readonly allAvatarClasses;
    private static readonly ownedAvatarAccessories;
    private static readonly ownedAvatarFaces;
    private static readonly avatarSkinAccessories;
    static defaultOutfit: AccessoryOutfit | undefined;
    static readonly skinColors: Color[];
    static Initialize(): void;
    static DownloadOwnedAccessories(): void;
    static GetClass(classId: string): AccessoryClass | undefined;
    static GetClassThumbnailUrl(classId: string): string;
    static InitUserOutfits(userId: string): void;
    static AddAvailableAvatarItem(instanceId: string, item: AccessoryComponent): void;
    static AddAvailableFaceItem(item: AccessoryFace): void;
    static GetAllAvatarItems(slotType: AccessorySlot): {
        instanceId: string;
        item: AccessoryComponent;
    }[] | undefined;
    static GetAllAvatarFaceItems(): AccessoryFace[];
    static GetAllAvatarSkins(): AccessorySkin[];
    static GetAllPossibleAvatarItems(): Map<string, AccessoryComponent>;
    static GetAccessoryFromClassId(classId: string): AccessoryComponent | undefined;
    static GetAccessoryFaceFromClassId(classId: string): AccessoryFace | undefined;
    static LoadEquippedUserOutfit(builder: AccessoryBuilder, options?: {
        removeOldClothingAccessories?: boolean;
        combineMeshes?: boolean;
    }): void;
    static LoadDefaultOutfit(builder: AccessoryBuilder): void;
    static LoadUserOutfit(outfit: OutfitDto, builder: AccessoryBuilder, options?: {
        removeOldClothingAccessories?: boolean;
    }): void;
}
