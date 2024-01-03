export declare class AvatarUtil {
    static readonly defaultAccessoryCollectionPath = "@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
    private static readonly avatarAccessories;
    private static readonly avatarSkinAccessories;
    static defaultKitAccessory: AccessoryCollection | undefined;
    static readonly skinColors: Color[];
    static Initialize(): void;
    static AddAvailableAvatarItem(item: Accessory): void;
    static GetAllAvatarItems(slotType: AccessorySlot): Accessory[] | undefined;
    static GetAllAvatarSkins(): AccessorySkin[];
}
