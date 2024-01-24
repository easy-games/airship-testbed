/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
export type ItemClass = {
    resourceType: "GAME" | "ORGANIZATION";
    resourceId: string;
    classId: string;
    name: string;
    imageId: string;
    tags: string[];
    description: string;
    default: boolean;
    tradable: {
        permitted: boolean;
    };
    marketable: {
        permitted: boolean;
    };
};
export type Item = {
    ownerId: string;
    class: ItemClass;
    instanceId: string;
    createdAt: string;
};
export type ProfilePicture = ItemClass & {
    profilePicture: {
        imageId: string;
    };
};
export type ProfilePictureItem = Omit<Item, "class"> & {
    class: ProfilePicture;
};
export type Accessory = ItemClass & {
    accessory: {};
};
export type AccessoryItem = Omit<Item, "class"> & {
    class: Accessory;
};
export type Outfit = {
    outfitId: string;
    name: string;
    skinColor: string;
    accessories: Array<AccessoryItem>;
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
    static SaveOutfitAccessories(outfitId: string, instanceIds: string[]): Outfit;
    static SaveAvatarOutfit(outfit: Outfit): void;
    static LoadImage(fileId: string): AccessoryItem[];
}
