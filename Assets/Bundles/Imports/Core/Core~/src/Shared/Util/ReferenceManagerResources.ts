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
	GenericVFX,
	DeathVFX,
	DeathVoidVFX,
	FlinchAnimFPS,
	DeathAnimFPS,
	FlinchAnimTP,
	DeathAnimTP,
}

export enum Bundle_Entity_Movement{
	NONE = -1,
	SprintTrail,
	JumpSFX,
	LandSFX,
	SlideSFX0,
	SlideSFX1,
	SlideSFX2,
	SlideSFX3,
	SlideSFXLoop,
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

export enum Bundle_ItemBlock_Prefabs{
	NONE = -1,
}

export enum Bundle_ItemBlock_SFX{
	NONE = -1,
	Equip,
}

export enum Bundle_ItemBlock{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
	Prefabs,
	SFX,
}

export enum Bundle_ItemBow_FirstPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Charge,
	Shoot,
}

export enum Bundle_ItemBow_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Charge,
	Shoot,
}

export enum Bundle_ItemBow_Prefabs{
	NONE = -1,
}

export enum Bundle_ItemBow_SFX{
	NONE = -1,
	Equip,
	Charge,
}

export enum Bundle_ItemBow{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
	Prefabs,
	SFX,
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

export enum Bundle_ItemSword_SFX{
	NONE = -1,
	Equip,
}

export enum Bundle_ItemSword{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
	Prefabs,
	SFX,
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

export enum Bundle_ItemUnarmed_Prefabs{
	NONE = -1,
}

export enum Bundle_ItemUnarmed_SFX{
	NONE = -1,
	Equip,
}

export enum Bundle_ItemUnarmed{
	NONE = -1,
	FirstPerson,
	ThirdPerson,
	Prefabs,
	SFX,
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
	ArrowHit,
	FireballExplosion,
}

export enum Bundle_Projectiles{
	NONE = -1,
	OnHitVFX,
}

export enum AllBundleItems{
	NONE = -1,
	Blocks_UI_HealthBar = "Client/Resources/Prefabs/BlockHealthbarCanvas.prefab",
	Blocks_VFX_OnHit = "Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitVFX.prefab",
	Blocks_VFX_OnDeath = "Shared/Resources/Prefabs/VFX/Blocks/OnBlockDeathVFX.prefab",
	Entity_OnHit_GenericVFX = "Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnHitVFX.prefab",
	Entity_OnHit_DeathVFX = "Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVFX.prefab",
	Entity_OnHit_DeathVoidVFX = "Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVoidVFX.prefab",
	Entity_OnHit_FlinchAnimFPS = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_FPS_Flinch.anim",
	Entity_OnHit_DeathAnimFPS = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_FPS_Death.anim",
	Entity_OnHit_FlinchAnimTP = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_TP_Flinch.anim",
	Entity_OnHit_DeathAnimTP = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_TP_Death.anim",
	Entity_Movement_SprintTrail = "Shared/Resources/Prefabs/VFX/Entity/Movement/SprintVFX.prefab",
	Entity_Movement_JumpSFX = "Imports/Core/Shared/Resources/Sound/Movement/JumpStart.ogg",
	Entity_Movement_LandSFX = "Imports/Core/Shared/Resources/Sound/Movement/JumpLand.ogg",
	Entity_Movement_SlideSFX0 = "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_01.wav",
	Entity_Movement_SlideSFX1 = "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_02.wav",
	Entity_Movement_SlideSFX2 = "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_03.wav",
	Entity_Movement_SlideSFX3 = "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_04.wav",
	Entity_Movement_SlideSFXLoop = "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Loop.wav",
	ItemBlock_FirstPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_FP_Blocks_Idle.anim",
	ItemBlock_FirstPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_FP_Blocks_Equip.anim",
	ItemBlock_FirstPerson_UnEquip = "",
	ItemBlock_FirstPerson_Use01 = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_FP_Blocks_Use.anim",
	ItemBlock_ThirdPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Idle.anim",
	ItemBlock_ThirdPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Equip.anim",
	ItemBlock_ThirdPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_UnEqup.anim",
	ItemBlock_ThirdPerson_Use = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Use.anim",
	ItemBlock_SFX_Equip = "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg",
	ItemBow_FirstPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Idle.anim",
	ItemBow_FirstPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Equip.anim",
	ItemBow_FirstPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_UnEquip.anim",
	ItemBow_FirstPerson_Charge = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Draw.anim",
	ItemBow_FirstPerson_Shoot = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Draw.anim",
	ItemBow_ThirdPerson_Idle = "",
	ItemBow_ThirdPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Equip.anim",
	ItemBow_ThirdPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_UnEquip.anim",
	ItemBow_ThirdPerson_Charge = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/BowDraw.anim",
	ItemBow_ThirdPerson_Shoot = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/BowDraw.anim",
	ItemBow_SFX_Equip = "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Bow.ogg",
	ItemBow_SFX_Charge = "Imports/Core/Shared/Resources/Sound/Items/Bow/Bow_Charge.ogg",
	ItemPickaxe_FirstPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Idle.anim",
	ItemPickaxe_FirstPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Equip.anim",
	ItemPickaxe_FirstPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_UnEquip.anim",
	ItemPickaxe_FirstPerson_Use01 = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Use.anim",
	ItemPickaxe_ThirdPerson_Idle = "",
	ItemPickaxe_ThirdPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Equip.anim",
	ItemPickaxe_ThirdPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_UnEqup.anim",
	ItemPickaxe_ThirdPerson_Use = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Use.anim",
	ItemPickaxe_Prefabs_OnUse = "Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingFX.prefab",
	ItemPickaxe_Prefabs_OnHit = "Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitFX.prefab",
	ItemSword_FirstPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Idle.anim",
	ItemSword_FirstPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Equip.anim",
	ItemSword_FirstPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_UnEquip.anim",
	ItemSword_FirstPerson_Use01 = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Use.anim",
	ItemSword_ThirdPerson_Idle = "",
	ItemSword_ThirdPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Equip.anim",
	ItemSword_ThirdPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_UnEqup.anim",
	ItemSword_ThirdPerson_Use = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_TP_Sword_Use.anim",
	ItemSword_Prefabs_OnUse = "Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingFX.prefab",
	ItemSword_Prefabs_OnHit = "Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitFX.prefab",
	ItemSword_SFX_Equip = "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Sword.ogg",
	ItemThrowable_FirstPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_Idle.anim",
	ItemThrowable_FirstPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_Equip.anim",
	ItemThrowable_FirstPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_UnEquip.anim",
	ItemThrowable_FirstPerson_Charge = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_Charge.anim",
	ItemThrowable_FirstPerson_Throw = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Sword/Neon_FP_Sword_Use.anim",
	ItemThrowable_ThirdPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Idle.anim",
	ItemThrowable_ThirdPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Equip.anim",
	ItemThrowable_ThirdPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_UnEquip.anim",
	ItemThrowable_ThirdPerson_Charge = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Charge.anim",
	ItemThrowable_ThirdPerson_Throw = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_Use.anim",
	ItemUnarmed_FirstPerson_Idle = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_Idle.anim",
	ItemUnarmed_FirstPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_Equip.anim",
	ItemUnarmed_FirstPerson_UnEquip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_UnEquip.anim",
	ItemUnarmed_FirstPerson_Use01 = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_FP_Generic_Use.anim",
	ItemUnarmed_ThirdPerson_Idle = "",
	ItemUnarmed_ThirdPerson_Equip = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_TP_Generic_Equip.anim",
	ItemUnarmed_ThirdPerson_UnEquip = "",
	ItemUnarmed_ThirdPerson_Use = "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Generic/Neon_TP_Generic_Use.anim",
	ItemUnarmed_SFX_Equip = "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg",
	HeldItem_OnUse_SwordSwing = "Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingFX.prefab",
	HeldItem_OnHit_SwordHit = "Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitFX.prefab",
	Projectiles_OnHitVFX_ArrowHit = "Shared/Resources/Prefabs/VFX/Projectiles/OnArrowHitVfx.prefab",
	Projectiles_OnHitVFX_FireballExplosion = "Shared/Resources/Accessories/Weapons/Fireball/FireballOnHitVFX.prefab",
}

export enum BundleGroupNames{
	NONE = -1,
	Blocks,
	Entity,
	ItemBlock,
	ItemBow,
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
				[Bundle_Entity_OnHit.GenericVFX, "Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnHitVFX.prefab"],
				[Bundle_Entity_OnHit.DeathVFX, "Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVFX.prefab"],
				[Bundle_Entity_OnHit.DeathVoidVFX, "Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVoidVFX.prefab"],
				[Bundle_Entity_OnHit.FlinchAnimFPS, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_FPS_Flinch.anim"],
				[Bundle_Entity_OnHit.DeathAnimFPS, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_FPS_Death.anim"],
				[Bundle_Entity_OnHit.FlinchAnimTP, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_TP_Flinch.anim"],
				[Bundle_Entity_OnHit.DeathAnimTP, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Root/OnHit/Armature_TP_Death.anim"],
			])}],
		[Bundle_Entity.Movement, {
			id: Bundle_Entity.Movement,
			filePaths: new Map([
				[Bundle_Entity_Movement.SprintTrail, "Shared/Resources/Prefabs/VFX/Entity/Movement/SprintVFX.prefab"],
				[Bundle_Entity_Movement.JumpSFX, "Imports/Core/Shared/Resources/Sound/Movement/JumpStart.ogg"],
				[Bundle_Entity_Movement.LandSFX, "Imports/Core/Shared/Resources/Sound/Movement/JumpLand.ogg"],
				[Bundle_Entity_Movement.SlideSFX0, "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_01.wav"],
				[Bundle_Entity_Movement.SlideSFX1, "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_02.wav"],
				[Bundle_Entity_Movement.SlideSFX2, "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_03.wav"],
				[Bundle_Entity_Movement.SlideSFX3, "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_04.wav"],
				[Bundle_Entity_Movement.SlideSFXLoop, "Imports/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Loop.wav"],
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
		[Bundle_ItemBlock.Prefabs, {
			id: Bundle_ItemBlock.Prefabs,
			filePaths: new Map([
			])}],
		[Bundle_ItemBlock.SFX, {
			id: Bundle_ItemBlock.SFX,
			filePaths: new Map([
				[Bundle_ItemBlock_SFX.Equip, "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg"],
			])}],
		])
	}

	public static readonly ItemBow:BundleGroup = {
		id: BundleGroupNames.ItemBow,
		bundles: new Map([
		[Bundle_ItemBow.FirstPerson, {
			id: Bundle_ItemBow.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemBow_FirstPerson.Idle, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Idle.anim"],
				[Bundle_ItemBow_FirstPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Equip.anim"],
				[Bundle_ItemBow_FirstPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_FP_Throw_UnEquip.anim"],
				[Bundle_ItemBow_FirstPerson.Charge, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Draw.anim"],
				[Bundle_ItemBow_FirstPerson.Shoot, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/Armature_FPS_Bow_Draw.anim"],
			])}],
		[Bundle_ItemBow.ThirdPerson, {
			id: Bundle_ItemBow.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemBow_ThirdPerson.Idle, ""],
				[Bundle_ItemBow_ThirdPerson.Equip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Blocks/Neon_TP_Blocks_Equip.anim"],
				[Bundle_ItemBow_ThirdPerson.UnEquip, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Throwable/Neon_TP_Throw_UnEquip.anim"],
				[Bundle_ItemBow_ThirdPerson.Charge, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/BowDraw.anim"],
				[Bundle_ItemBow_ThirdPerson.Shoot, "Shared/Resources/Entity/HumanEntity/HumanAnimations/Items/Bow/BowDraw.anim"],
			])}],
		[Bundle_ItemBow.Prefabs, {
			id: Bundle_ItemBow.Prefabs,
			filePaths: new Map([
			])}],
		[Bundle_ItemBow.SFX, {
			id: Bundle_ItemBow.SFX,
			filePaths: new Map([
				[Bundle_ItemBow_SFX.Equip, "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Bow.ogg"],
				[Bundle_ItemBow_SFX.Charge, "Imports/Core/Shared/Resources/Sound/Items/Bow/Bow_Charge.ogg"],
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
		[Bundle_ItemSword.SFX, {
			id: Bundle_ItemSword.SFX,
			filePaths: new Map([
				[Bundle_ItemSword_SFX.Equip, "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Sword.ogg"],
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
		[Bundle_ItemUnarmed.Prefabs, {
			id: Bundle_ItemUnarmed.Prefabs,
			filePaths: new Map([
			])}],
		[Bundle_ItemUnarmed.SFX, {
			id: Bundle_ItemUnarmed.SFX,
			filePaths: new Map([
				[Bundle_ItemUnarmed_SFX.Equip, "Imports/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg"],
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
				[Bundle_Projectiles_OnHitVFX.ArrowHit, "Shared/Resources/Prefabs/VFX/Projectiles/OnArrowHitVfx.prefab"],
				[Bundle_Projectiles_OnHitVFX.FireballExplosion, "Shared/Resources/Accessories/Weapons/Fireball/FireballOnHitVFX.prefab"],
			])}],
		])
	}

	public static readonly bundleGroups:Map<number, BundleGroup> = new Map([
		[BundleGroupNames.Blocks, ReferenceManagerAssets.Blocks],
		[BundleGroupNames.Entity, ReferenceManagerAssets.Entity],
		[BundleGroupNames.ItemBlock, ReferenceManagerAssets.ItemBlock],
		[BundleGroupNames.ItemBow, ReferenceManagerAssets.ItemBow],
		[BundleGroupNames.ItemPickaxe, ReferenceManagerAssets.ItemPickaxe],
		[BundleGroupNames.ItemSword, ReferenceManagerAssets.ItemSword],
		[BundleGroupNames.ItemThrowable, ReferenceManagerAssets.ItemThrowable],
		[BundleGroupNames.ItemUnarmed, ReferenceManagerAssets.ItemUnarmed],
		[BundleGroupNames.HeldItem, ReferenceManagerAssets.HeldItem],
		[BundleGroupNames.Projectiles, ReferenceManagerAssets.Projectiles],
	]);
}