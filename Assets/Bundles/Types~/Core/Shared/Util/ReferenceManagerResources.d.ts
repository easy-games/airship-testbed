export interface BundleGroup {
    id: BundleGroupNames;
    bundles: Map<number, BundleData>;
}
export interface BundleData {
    id: Number;
    filePaths: Map<number, string>;
}
export declare enum Bundle_Blocks_UI {
    NONE = -1,
    HealthBar = 0
}
export declare enum Bundle_Blocks_VFX {
    NONE = -1,
    OnHit = 0,
    OnDeath = 1
}
export declare enum Bundle_Blocks {
    NONE = -1,
    UI = 0,
    VFX = 1
}
export declare enum Bundle_Entity_OnHit {
    NONE = -1,
    GenericVFX = 0,
    DeathVFX = 1,
    DeathVoidVFX = 2,
    FlinchAnimFPS = 3,
    DeathAnimFPS = 4,
    FlinchAnimTP = 5,
    DeathAnimTP = 6
}
export declare enum Bundle_Entity_Movement {
    NONE = -1,
    SprintTrail = 0,
    SlideSFX = 1,
    JumpSFX = 2,
    LandSFX = 3
}
export declare enum Bundle_Entity {
    NONE = -1,
    OnHit = 0,
    Movement = 1
}
export declare enum Bundle_ItemBlock_FirstPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use01 = 3
}
export declare enum Bundle_ItemBlock_ThirdPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use = 3
}
export declare enum Bundle_ItemBlock_Prefabs {
    NONE = -1
}
export declare enum Bundle_ItemBlock_SFX {
    NONE = -1,
    Equip = 0
}
export declare enum Bundle_ItemBlock {
    NONE = -1,
    FirstPerson = 0,
    ThirdPerson = 1,
    Prefabs = 2,
    SFX = 3
}
export declare enum Bundle_ItemBow_FirstPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Charge = 3,
    Shoot = 4
}
export declare enum Bundle_ItemBow_ThirdPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Charge = 3,
    Shoot = 4
}
export declare enum Bundle_ItemBow_Prefabs {
    NONE = -1
}
export declare enum Bundle_ItemBow_SFX {
    NONE = -1,
    Equip = 0,
    Charge = 1
}
export declare enum Bundle_ItemBow {
    NONE = -1,
    FirstPerson = 0,
    ThirdPerson = 1,
    Prefabs = 2,
    SFX = 3
}
export declare enum Bundle_ItemPickaxe_FirstPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use01 = 3
}
export declare enum Bundle_ItemPickaxe_ThirdPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use = 3
}
export declare enum Bundle_ItemPickaxe_Prefabs {
    NONE = -1,
    OnUse = 0,
    OnHit = 1
}
export declare enum Bundle_ItemPickaxe {
    NONE = -1,
    FirstPerson = 0,
    ThirdPerson = 1,
    Prefabs = 2
}
export declare enum Bundle_ItemSword_FirstPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use01 = 3
}
export declare enum Bundle_ItemSword_ThirdPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use = 3
}
export declare enum Bundle_ItemSword_Prefabs {
    NONE = -1,
    OnUse = 0,
    OnHit = 1
}
export declare enum Bundle_ItemSword_SFX {
    NONE = -1,
    Equip = 0
}
export declare enum Bundle_ItemSword {
    NONE = -1,
    FirstPerson = 0,
    ThirdPerson = 1,
    Prefabs = 2,
    SFX = 3
}
export declare enum Bundle_ItemThrowable_FirstPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Charge = 3,
    Throw = 4
}
export declare enum Bundle_ItemThrowable_ThirdPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Charge = 3,
    Throw = 4
}
export declare enum Bundle_ItemThrowable {
    NONE = -1,
    FirstPerson = 0,
    ThirdPerson = 1
}
export declare enum Bundle_ItemUnarmed_FirstPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use01 = 3
}
export declare enum Bundle_ItemUnarmed_ThirdPerson {
    NONE = -1,
    Idle = 0,
    Equip = 1,
    UnEquip = 2,
    Use = 3
}
export declare enum Bundle_ItemUnarmed_Prefabs {
    NONE = -1
}
export declare enum Bundle_ItemUnarmed_SFX {
    NONE = -1,
    Equip = 0
}
export declare enum Bundle_ItemUnarmed {
    NONE = -1,
    FirstPerson = 0,
    ThirdPerson = 1,
    Prefabs = 2,
    SFX = 3
}
export declare enum Bundle_HeldItem_OnUse {
    NONE = -1,
    SwordSwing = 0
}
export declare enum Bundle_HeldItem_OnHit {
    NONE = -1,
    SwordHit = 0
}
export declare enum Bundle_HeldItem {
    NONE = -1,
    OnUse = 0,
    OnHit = 1
}
export declare enum Bundle_Projectiles_OnHitVFX {
    NONE = -1,
    Arrow = 0
}
export declare enum Bundle_Projectiles {
    NONE = -1,
    OnHitVFX = 0
}
export declare enum BundleGroupNames {
    NONE = -1,
    Blocks = 0,
    Entity = 1,
    ItemBlock = 2,
    ItemBow = 3,
    ItemPickaxe = 4,
    ItemSword = 5,
    ItemThrowable = 6,
    ItemUnarmed = 7,
    HeldItem = 8,
    Projectiles = 9
}
export declare class ReferenceManagerAssets {
    static readonly Blocks: BundleGroup;
    static readonly Entity: BundleGroup;
    static readonly ItemBlock: BundleGroup;
    static readonly ItemBow: BundleGroup;
    static readonly ItemPickaxe: BundleGroup;
    static readonly ItemSword: BundleGroup;
    static readonly ItemThrowable: BundleGroup;
    static readonly ItemUnarmed: BundleGroup;
    static readonly HeldItem: BundleGroup;
    static readonly Projectiles: BundleGroup;
    static readonly bundleGroups: Map<number, BundleGroup>;
}
