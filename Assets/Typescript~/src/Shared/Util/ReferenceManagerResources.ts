export interface BundleGroup{ 
	id:BundleGroupNames; 
	bundles:Map<number, BundleData>;
}

export interface BundleData{
	id:Number;
	filePaths:Map<number, string>;
}

export enum Bundle_Blocks_UI{
	NONE = -1,
	HealthBar,
}

export enum Bundle_Blocks_VFX{
	NONE = -1,
	OnHit,
	OnDeath,
}

export enum Bundle_Blocks{
	NONE = -1,
	UI,
	VFX,
}

export enum Bundle_Entity_OnHit{
	NONE = -1,
	GeneralAnim,
	GenericVFX,
}

export enum Bundle_Entity_Movement{
	NONE = -1,
	SprintTrail,
	SlideSFX,
	JumpSFX,
	LandSFX,
}

export enum Bundle_Entity{
	NONE = -1,
	OnHit,
	Movement,
}

export enum Bundle_ItemBlock_FirstPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use01,
}

export enum Bundle_ItemBlock_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use,
}

export enum Bundle_ItemBlock{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
}

export enum Bundle_ItemPickaxe_FirstPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use01,
}

export enum Bundle_ItemPickaxe_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use,
}

export enum Bundle_ItemPickaxe_Prefabs{
	NONE = -1,
	OnUse,
	OnHit,
}

export enum Bundle_ItemPickaxe{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
	Prefabs,
}

export enum Bundle_ItemSword_FirstPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use01,
}

export enum Bundle_ItemSword_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use,
}

export enum Bundle_ItemSword_Prefabs{
	NONE = -1,
	OnUse,
	OnHit,
}

export enum Bundle_ItemSword{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
	Prefabs,
}

export enum Bundle_ItemThrowable_FirstPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Charge,
	Throw,
}

export enum Bundle_ItemThrowable_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Charge,
	Throw,
}

export enum Bundle_ItemThrowable{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
}

export enum Bundle_ItemUnarmed_FirstPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use01,
}

export enum Bundle_ItemUnarmed_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Use,
}

export enum Bundle_ItemUnarmed{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
}

export enum Bundle_HeldItem_OnUse{
	NONE = -1,
	SwordSwing,
}

export enum Bundle_HeldItem_OnHit{
	NONE = -1,
	SwordHit,
}

export enum Bundle_HeldItem{
	NONE = -1,
	OnUse,
	OnHit,
}

export enum Bundle_Projectiles_OnHitVFX{
	NONE = -1,
	Arrow,
}

export enum Bundle_Projectiles{
	NONE = -1,
	OnHitVFX,
}

export enum BundleGroupNames{
	NONE = -1,
	Blocks,
	Entity,
	ItemBlock,
	ItemPickaxe,
	ItemSword,
	ItemThrowable,
	ItemUnarmed,
	HeldItem,
	Projectiles,
}



export class ReferenceManagerAssets{
	public static readonly Blocks:BundleGroup = {
		id: BundleGroupNames.Blocks,
		bundles: new Map([
		[Bundle_Blocks.UI, {
			id: Bundle_Blocks.UI,
			filePaths: new Map([
				[Bundle_Blocks_UI.HealthBar, "Client/Resources/Prefabs/BlockHealthbarCanvas.prefab"],
			])}],
		[Bundle_Blocks.VFX, {
			id: Bundle_Blocks.VFX,
			filePaths: new Map([
				[Bundle_Blocks_VFX.OnHit, "Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitVFX.prefab"],
				[Bundle_Blocks_VFX.OnDeath, "Shared/Resources/Prefabs/VFX/Blocks/OnBlockDeathVFX.prefab"],
			])}],
		])
	}

	public static readonly Entity:BundleGroup = {
		id: BundleGroupNames.Entity,
		bundles: new Map([
		[Bundle_Entity.OnHit, {
			id: Bundle_Entity.OnHit,
			filePaths: new Map([
				[Bundle_Entity_OnHit.GeneralAnim, "Shared/Resources/Prefabs/VFX/Entity/OnHit/DamagFlash.anim"],
				[Bundle_Entity_OnHit.GenericVFX, "Shared/Resources/Prefabs/VFX/Entity/OnHit/OnHitVFX.prefab"],
			])}],
		[Bundle_Entity.Movement, {
			id: Bundle_Entity.Movement,
			filePaths: new Map([
				[Bundle_Entity_Movement.SprintTrail, "Shared/Resources/Prefabs/VFX/Entity/Movement/SprintVFX.prefab"],
				[Bundle_Entity_Movement.SlideSFX, "Shared/Resources/Sound/Movement/SlideStart.ogg"],
				[Bundle_Entity_Movement.JumpSFX, "Shared/Resources/Sound/Movement/JumpStart.ogg"],
				[Bundle_Entity_Movement.LandSFX, "Shared/Resources/Sound/Movement/JumpLand.ogg"],
			])}],
		])
	}

	public static readonly ItemBlock:BundleGroup = {
		id: BundleGroupNames.ItemBlock,
		bundles: new Map([
		[Bundle_ItemBlock.FirstPerson, {
			id: Bundle_ItemBlock.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemBlock_FirstPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_FP_Blocks_Idle.anim"],
				[Bundle_ItemBlock_FirstPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_FP_Blocks_Equip.anim"],
				[Bundle_ItemBlock_FirstPerson.UnEquip, ""],
				[Bundle_ItemBlock_FirstPerson.Use01, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_FP_Blocks_Use.anim"],
			])}],
		[Bundle_ItemBlock.ThirdPerson, {
			id: Bundle_ItemBlock.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemBlock_ThirdPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Idle.anim"],
				[Bundle_ItemBlock_ThirdPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Equip.anim"],
				[Bundle_ItemBlock_ThirdPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_UnEqup.anim"],
				[Bundle_ItemBlock_ThirdPerson.Use, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Use.anim"],
			])}],
		])
	}

	public static readonly ItemPickaxe:BundleGroup = {
		id: BundleGroupNames.ItemPickaxe,
		bundles: new Map([
		[Bundle_ItemPickaxe.FirstPerson, {
			id: Bundle_ItemPickaxe.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemPickaxe_FirstPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Idle.anim"],
				[Bundle_ItemPickaxe_FirstPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Equip.anim"],
				[Bundle_ItemPickaxe_FirstPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_UnEquip.anim"],
				[Bundle_ItemPickaxe_FirstPerson.Use01, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Use.anim"],
			])}],
		[Bundle_ItemPickaxe.ThirdPerson, {
			id: Bundle_ItemPickaxe.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemPickaxe_ThirdPerson.Idle, ""],
				[Bundle_ItemPickaxe_ThirdPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Equip.anim"],
				[Bundle_ItemPickaxe_ThirdPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_UnEqup.anim"],
				[Bundle_ItemPickaxe_ThirdPerson.Use, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Use.anim"],
			])}],
		[Bundle_ItemPickaxe.Prefabs, {
			id: Bundle_ItemPickaxe.Prefabs,
			filePaths: new Map([
				[Bundle_ItemPickaxe_Prefabs.OnUse, "Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingFX.prefab"],
				[Bundle_ItemPickaxe_Prefabs.OnHit, "Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitFX.prefab"],
			])}],
		])
	}

	public static readonly ItemSword:BundleGroup = {
		id: BundleGroupNames.ItemSword,
		bundles: new Map([
		[Bundle_ItemSword.FirstPerson, {
			id: Bundle_ItemSword.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemSword_FirstPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Idle.anim"],
				[Bundle_ItemSword_FirstPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Equip.anim"],
				[Bundle_ItemSword_FirstPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_UnEquip.anim"],
				[Bundle_ItemSword_FirstPerson.Use01, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Use.anim"],
			])}],
		[Bundle_ItemSword.ThirdPerson, {
			id: Bundle_ItemSword.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemSword_ThirdPerson.Idle, ""],
				[Bundle_ItemSword_ThirdPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Equip.anim"],
				[Bundle_ItemSword_ThirdPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_UnEqup.anim"],
				[Bundle_ItemSword_ThirdPerson.Use, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Use.anim"],
			])}],
		[Bundle_ItemSword.Prefabs, {
			id: Bundle_ItemSword.Prefabs,
			filePaths: new Map([
				[Bundle_ItemSword_Prefabs.OnUse, "Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingFX.prefab"],
				[Bundle_ItemSword_Prefabs.OnHit, "Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitFX.prefab"],
			])}],
		])
	}

	public static readonly ItemThrowable:BundleGroup = {
		id: BundleGroupNames.ItemThrowable,
		bundles: new Map([
		[Bundle_ItemThrowable.FirstPerson, {
			id: Bundle_ItemThrowable.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemThrowable_FirstPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_Idle.anim"],
				[Bundle_ItemThrowable_FirstPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_Equip.anim"],
				[Bundle_ItemThrowable_FirstPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_UnEquip.anim"],
				[Bundle_ItemThrowable_FirstPerson.Charge, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_Charge.anim"],
				[Bundle_ItemThrowable_FirstPerson.Throw, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Use.anim"],
			])}],
		[Bundle_ItemThrowable.ThirdPerson, {
			id: Bundle_ItemThrowable.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemThrowable_ThirdPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Idle.anim"],
				[Bundle_ItemThrowable_ThirdPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Equip.anim"],
				[Bundle_ItemThrowable_ThirdPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_UnEquip.anim"],
				[Bundle_ItemThrowable_ThirdPerson.Charge, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Charge.anim"],
				[Bundle_ItemThrowable_ThirdPerson.Throw, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Use.anim"],
			])}],
		])
	}

	public static readonly ItemUnarmed:BundleGroup = {
		id: BundleGroupNames.ItemUnarmed,
		bundles: new Map([
		[Bundle_ItemUnarmed.FirstPerson, {
			id: Bundle_ItemUnarmed.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemUnarmed_FirstPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_Idle.anim"],
				[Bundle_ItemUnarmed_FirstPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_Equip.anim"],
				[Bundle_ItemUnarmed_FirstPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_UnEquip.anim"],
				[Bundle_ItemUnarmed_FirstPerson.Use01, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_Use.anim"],
			])}],
		[Bundle_ItemUnarmed.ThirdPerson, {
			id: Bundle_ItemUnarmed.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemUnarmed_ThirdPerson.Idle, ""],
				[Bundle_ItemUnarmed_ThirdPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_TP_Generic_Equip.anim"],
				[Bundle_ItemUnarmed_ThirdPerson.UnEquip, ""],
				[Bundle_ItemUnarmed_ThirdPerson.Use, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_TP_Generic_Use.anim"],
			])}],
		])
	}

	public static readonly HeldItem:BundleGroup = {
		id: BundleGroupNames.HeldItem,
		bundles: new Map([
		[Bundle_HeldItem.OnUse, {
			id: Bundle_HeldItem.OnUse,
			filePaths: new Map([
				[Bundle_HeldItem_OnUse.SwordSwing, "Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingFX.prefab"],
			])}],
		[Bundle_HeldItem.OnHit, {
			id: Bundle_HeldItem.OnHit,
			filePaths: new Map([
				[Bundle_HeldItem_OnHit.SwordHit, "Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitFX.prefab"],
			])}],
		])
	}

	public static readonly Projectiles:BundleGroup = {
		id: BundleGroupNames.Projectiles,
		bundles: new Map([
		[Bundle_Projectiles.OnHitVFX, {
			id: Bundle_Projectiles.OnHitVFX,
			filePaths: new Map([
				[Bundle_Projectiles_OnHitVFX.Arrow, "Shared/Resources/Prefabs/VFX/Projectiles/OnArrowHitVfx.prefab"],
			])}],
		])
	}

	public static readonly bundleGroups:Map<number, BundleGroup> = new Map([
		[BundleGroupNames.Blocks, ReferenceManagerAssets.Blocks],
		[BundleGroupNames.Blocks, ReferenceManagerAssets.Blocks],
		[BundleGroupNames.Entity, ReferenceManagerAssets.Entity],
		[BundleGroupNames.Entity, ReferenceManagerAssets.Entity],
		[BundleGroupNames.ItemBlock, ReferenceManagerAssets.ItemBlock],
		[BundleGroupNames.ItemBlock, ReferenceManagerAssets.ItemBlock],
		[BundleGroupNames.ItemPickaxe, ReferenceManagerAssets.ItemPickaxe],
		[BundleGroupNames.ItemPickaxe, ReferenceManagerAssets.ItemPickaxe],
		[BundleGroupNames.ItemPickaxe, ReferenceManagerAssets.ItemPickaxe],
		[BundleGroupNames.ItemSword, ReferenceManagerAssets.ItemSword],
		[BundleGroupNames.ItemSword, ReferenceManagerAssets.ItemSword],
		[BundleGroupNames.ItemSword, ReferenceManagerAssets.ItemSword],
		[BundleGroupNames.ItemThrowable, ReferenceManagerAssets.ItemThrowable],
		[BundleGroupNames.ItemThrowable, ReferenceManagerAssets.ItemThrowable],
		[BundleGroupNames.ItemUnarmed, ReferenceManagerAssets.ItemUnarmed],
		[BundleGroupNames.ItemUnarmed, ReferenceManagerAssets.ItemUnarmed],
		[BundleGroupNames.HeldItem, ReferenceManagerAssets.HeldItem],
		[BundleGroupNames.HeldItem, ReferenceManagerAssets.HeldItem],
		[BundleGroupNames.Projectiles, ReferenceManagerAssets.Projectiles],
	]);
}