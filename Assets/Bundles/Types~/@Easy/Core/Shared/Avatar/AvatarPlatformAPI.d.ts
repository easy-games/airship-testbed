export type ItemClass = {
    resourceType: "GAME" | "ORGANIZATION";
    resourceId: string;
    classId: string;
    name: string;
    imageId: string;
    description: string;
};
export type AccessoryClass = ItemClass & {
    accessory: {};
};
export type AccessoryItem = {
    instanceId: string;
    class: AccessoryClass;
};
export type Accessory = {
    item: AccessoryItem;
};
export type Outfit = {
    outfitId: string;
    owner: string;
    name: string;
    accessories: Accessory[];
    skinColor: string;
    equipped: boolean;
};
export declare class AvatarPlatformAPI {
    private static Log;
    static GetHttpUrl(path: string): string;
    static GetAllOutfits(): Outfit[] | undefined;
    static GetEquippedOutfit(): Outfit | undefined;
    static GetAvatarOutfit(outfitId: string): Outfit | undefined;
    static CreateAvatarOutfit(outfit: Outfit): void;
    static EquipAvatarOutfit(outfitId: string): void;
    static GetAccessories(): AccessoryItem[] | undefined;
    static CreateDefaultAvatarOutfit(entityId: string, outfitId: string, name: string, skinColor: Color): Outfit;
    static SaveOutfitAccessories(classIds: string[]): void;
    static SaveAvatarOutfit(outfit: Outfit): void;
    static LoadImage(fileId: string): AccessoryItem[] | undefined;
}
