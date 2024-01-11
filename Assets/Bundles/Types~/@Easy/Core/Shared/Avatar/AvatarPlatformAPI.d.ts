export type ItemClass = {
    resourceType: "GAME" | "ORGANIZATION";
    resourceId: string;
    classId: string;
    name: string;
    imageId: string;
    description: string;
};
export type Accessory = {
    item: {
        instanceId: string;
        class: ItemClass & {
            accessory: {};
        };
    };
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
    static GetAllOutfits(): Outfit[] | undefined;
    static GetEquippedOutfit(): Outfit | undefined;
    static GetAvatarOutfit(outfitId: string): Outfit | undefined;
    static CreateAvatarOutfit(outfit: Outfit): void;
    static EquipAvatarOutfit(outfitId: string): void;
    static CreateDefaultAvatarOutfit(entityId: string, outfitId: string, name: string, skinColor: Color): Outfit;
    static SaveAvatarOutfit(outfit: Outfit): void;
}
