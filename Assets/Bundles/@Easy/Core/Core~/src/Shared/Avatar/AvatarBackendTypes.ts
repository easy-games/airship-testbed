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