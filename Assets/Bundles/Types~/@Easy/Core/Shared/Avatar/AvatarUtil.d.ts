export declare class AvatarUtil {
    static readonly defaultAccessoryCollectionPath = "@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
    private static readonly allAvatarAccessories;
    private static readonly ownedAvatarAccessories;
    private static readonly avatarSkinAccessories;
    static defaultKitAccessory: AccessoryCollection | undefined;
    static readonly skinColors: Color[];
    static Initialize(): void;
    static GetOwnedAccessories(): void;
    static AddAvailableAvatarItem(item: AccessoryComponent): void;
    static GetAllAvatarItems(slotType: AccessorySlot): AccessoryComponent[] | undefined;
    static GetAllAvatarSkins(): AccessorySkin[];
    static GetAccessoryFromClassId(classId: string): AccessoryComponent | undefined;
}
