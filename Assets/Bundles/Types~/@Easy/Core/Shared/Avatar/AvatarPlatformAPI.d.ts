import { AccessoryInstance, Outfit } from "../Airship/Types/Outputs/PlatformInventory";
export declare class AvatarPlatformAPI {
    private static Log;
    static GetHttpUrl(path: string): string;
    static GetAllOutfits(): Outfit[] | undefined;
    static GetEquippedOutfit(): Outfit | undefined;
    static GetAvatarOutfit(outfitId: string): Outfit | undefined;
    static CreateAvatarOutfit(outfit: Outfit): void;
    static EquipAvatarOutfit(outfitId: string): void;
    static GetAccessories(): AccessoryInstance[] | undefined;
    static CreateDefaultAvatarOutfit(entityId: string, outfitId: string, name: string, skinColor: Color): Outfit;
    static SaveOutfitAccessories(outfitId: string, instanceIds: string[]): Outfit;
    static SaveAvatarOutfit(outfit: Outfit): void;
    static LoadImage(fileId: string): AccessoryInstance[];
}
