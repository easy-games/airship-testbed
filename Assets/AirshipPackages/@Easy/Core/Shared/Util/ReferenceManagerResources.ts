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
	OnHitFire,
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
	LandVFX,
	SprintOverlayVFX,
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
	Inspect,
	Swing01,
	Swing02,
}

export enum Bundle_ItemSword_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Swing01,
	Swing02,
}

export enum Bundle_ItemSword_Prefabs{
	NONE = -1,
	OnSwing01,
	OnSwing02,
	OnSwingFP01,
	OnSwingFP02,
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

export enum Bundle_ItemSwordBig_FirstPerson{
	NONE = -1,
	Idle,
	Equip,
	Inspect,
	Swing01,
	Swing02,
}

export enum Bundle_ItemSwordBig_ThirdPerson{
	NONE = -1,
	Idle,
	Equip,
	UnEquip,
	Swing01,
	Swing02,
}

export enum Bundle_ItemSwordBig_Prefabs{
	NONE = -1,
	OnSwing01,
	OnSwing02,
	OnSwingFP01,
	OnSwingFP02,
	OnHit,
}

export enum Bundle_ItemSwordBig_SFX{
	NONE = -1,
	Equip,
}

export enum Bundle_ItemSwordBig{
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
	Blocks_UI_HealthBar = "@Easy/Core/Client/Resources/Prefabs/BlockHealthbarCanvas.prefab",
	Blocks_VFX_OnHit = "@Easy/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitVFX.prefab",
	Blocks_VFX_OnDeath = "@Easy/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockDeathVFX.prefab",
	Blocks_VFX_OnHitFire = "@Easy/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitFireVFX.prefab",
	Entity_OnHit_GenericVFX = "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnHitVFX.prefab",
	Entity_OnHit_DeathVFX = "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVFX.prefab",
	Entity_OnHit_DeathVoidVFX = "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVoidVFX.prefab",
	Entity_OnHit_FlinchAnimFPS = "@Easy/Core/Shared/Resources/Character/Animations/FP_Flinch.anim",
	Entity_OnHit_DeathAnimFPS = "@Easy/Core/Shared/Resources/Character/Animations/TP_Death.anim",
	Entity_OnHit_FlinchAnimTP = "@Easy/Core/Shared/Resources/Character/Animations/TP_Flinch.anim",
	Entity_OnHit_DeathAnimTP = "@Easy/Core/Shared/Resources/Character/Animations/TP_Death.anim",
	Entity_Movement_SprintTrail = "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/Movement/SprintVFX.prefab",
	Entity_Movement_LandVFX = "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/Movement/LandingVFX.prefab",
	Entity_Movement_SprintOverlayVFX = "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/Movement/SprintOverlayVFX.prefab",
	Entity_Movement_JumpSFX = "@Easy/Core/Shared/Resources/Sound/Movement/JumpStart.ogg",
	Entity_Movement_LandSFX = "@Easy/Core/Shared/Resources/Sound/Movement/JumpLand.ogg",
	Entity_Movement_SlideSFX0 = "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_01.wav",
	Entity_Movement_SlideSFX1 = "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_02.wav",
	Entity_Movement_SlideSFX2 = "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_03.wav",
	Entity_Movement_SlideSFX3 = "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_04.wav",
	Entity_Movement_SlideSFXLoop = "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Loop.wav",
	ItemBlock_FirstPerson_Idle = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim",
	ItemBlock_FirstPerson_Equip = "",
	ItemBlock_FirstPerson_UnEquip = "",
	ItemBlock_FirstPerson_Use01 = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use.anim",
	ItemBlock_ThirdPerson_Idle = "",
	ItemBlock_ThirdPerson_Equip = "",
	ItemBlock_ThirdPerson_UnEquip = "",
	ItemBlock_ThirdPerson_Use = "",
	ItemBlock_SFX_Equip = "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg",
	ItemBow_FirstPerson_Idle = "",
	ItemBow_FirstPerson_Equip = "",
	ItemBow_FirstPerson_UnEquip = "",
	ItemBow_FirstPerson_Charge = "",
	ItemBow_FirstPerson_Shoot = "",
	ItemBow_ThirdPerson_Idle = "",
	ItemBow_ThirdPerson_Equip = "",
	ItemBow_ThirdPerson_UnEquip = "",
	ItemBow_ThirdPerson_Charge = "",
	ItemBow_ThirdPerson_Shoot = "",
	ItemBow_SFX_Equip = "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Bow.ogg",
	ItemBow_SFX_Charge = "@Easy/Core/Shared/Resources/Sound/Items/Bow/Bow_Charge.ogg",
	ItemPickaxe_FirstPerson_Idle = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim",
	ItemPickaxe_FirstPerson_Equip = "",
	ItemPickaxe_FirstPerson_UnEquip = "",
	ItemPickaxe_FirstPerson_Use01 = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use.anim",
	ItemPickaxe_ThirdPerson_Idle = "",
	ItemPickaxe_ThirdPerson_Equip = "",
	ItemPickaxe_ThirdPerson_UnEquip = "",
	ItemPickaxe_ThirdPerson_Use = "",
	ItemPickaxe_Prefabs_OnUse = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab",
	ItemPickaxe_Prefabs_OnHit = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab",
	ItemSword_FirstPerson_Idle = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim",
	ItemSword_FirstPerson_Equip = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim",
	ItemSword_FirstPerson_Inspect = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Inspect.anim",
	ItemSword_FirstPerson_Swing01 = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use.anim",
	ItemSword_FirstPerson_Swing02 = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use2.anim",
	ItemSword_ThirdPerson_Idle = "",
	ItemSword_ThirdPerson_Equip = "",
	ItemSword_ThirdPerson_UnEquip = "",
	ItemSword_ThirdPerson_Swing01 = "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use.anim",
	ItemSword_ThirdPerson_Swing02 = "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use2.anim",
	ItemSword_Prefabs_OnSwing01 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX01.prefab",
	ItemSword_Prefabs_OnSwing02 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX02.prefab",
	ItemSword_Prefabs_OnSwingFP01 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab",
	ItemSword_Prefabs_OnSwingFP02 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP02.prefab",
	ItemSword_Prefabs_OnHit = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab",
	ItemSword_SFX_Equip = "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Sword.ogg",
	ItemSwordBig_FirstPerson_Idle = "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Idle.anim",
	ItemSwordBig_FirstPerson_Equip = "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim",
	ItemSwordBig_FirstPerson_Inspect = "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Inspect.anim",
	ItemSwordBig_FirstPerson_Swing01 = "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Use.anim",
	ItemSwordBig_FirstPerson_Swing02 = "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Use2.anim",
	ItemSwordBig_ThirdPerson_Idle = "",
	ItemSwordBig_ThirdPerson_Equip = "",
	ItemSwordBig_ThirdPerson_UnEquip = "",
	ItemSwordBig_ThirdPerson_Swing01 = "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use.anim",
	ItemSwordBig_ThirdPerson_Swing02 = "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use2.anim",
	ItemSwordBig_Prefabs_OnSwing01 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX01.prefab",
	ItemSwordBig_Prefabs_OnSwing02 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX02.prefab",
	ItemSwordBig_Prefabs_OnSwingFP01 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab",
	ItemSwordBig_Prefabs_OnSwingFP02 = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP02.prefab",
	ItemSwordBig_Prefabs_OnHit = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab",
	ItemSwordBig_SFX_Equip = "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Sword.ogg",
	ItemThrowable_FirstPerson_Idle = "@Easy/Core/Shared/Resources/Character/Animations/FP_Generic_Idle.anim",
	ItemThrowable_FirstPerson_Equip = "",
	ItemThrowable_FirstPerson_UnEquip = "",
	ItemThrowable_FirstPerson_Charge = "@Easy/Core/Shared/Resources/Character/Animations/FP_Generic_Charge.anim",
	ItemThrowable_FirstPerson_Throw = "@Easy/Core/Shared/Resources/Character/Animations/FP_Generic_Throw.anim",
	ItemThrowable_ThirdPerson_Idle = "@Easy/Core/Shared/Resources/Character/Animations/TP_Generic_Idle.anim",
	ItemThrowable_ThirdPerson_Equip = "",
	ItemThrowable_ThirdPerson_UnEquip = "",
	ItemThrowable_ThirdPerson_Charge = "@Easy/Core/Shared/Resources/Character/Animations/TP_Generic_Charge.anim",
	ItemThrowable_ThirdPerson_Throw = "@Easy/Core/Shared/Resources/Character/Animations/TP_Generic_Throw.anim",
	ItemUnarmed_FirstPerson_Idle = "",
	ItemUnarmed_FirstPerson_Equip = "",
	ItemUnarmed_FirstPerson_UnEquip = "",
	ItemUnarmed_FirstPerson_Use01 = "",
	ItemUnarmed_ThirdPerson_Idle = "",
	ItemUnarmed_ThirdPerson_Equip = "",
	ItemUnarmed_ThirdPerson_UnEquip = "",
	ItemUnarmed_ThirdPerson_Use = "",
	ItemUnarmed_SFX_Equip = "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg",
	HeldItem_OnUse_SwordSwing = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab",
	HeldItem_OnHit_SwordHit = "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab",
	Projectiles_OnHitVFX_ArrowHit = "@Easy/Core/Shared/Resources/Prefabs/VFX/Projectiles/OnArrowHitVfx.prefab",
	Projectiles_OnHitVFX_FireballExplosion = "@Easy/Core/Shared/Resources/Accessories/Weapons/Fireball/FireballOnHitVFX.prefab",
}

export enum BundleGroupNames{
	NONE = -1,
	Blocks,
	Entity,
	ItemBlock,
	ItemBow,
	ItemPickaxe,
	ItemSword,
	ItemSwordBig,
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
				[Bundle_Blocks_UI.HealthBar, "@Easy/Core/Client/Resources/Prefabs/BlockHealthbarCanvas.prefab"],
			])}],
		[Bundle_Blocks.VFX, {
			id: Bundle_Blocks.VFX,
			filePaths: new Map([
				[Bundle_Blocks_VFX.OnHit, "@Easy/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitVFX.prefab"],
				[Bundle_Blocks_VFX.OnDeath, "@Easy/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockDeathVFX.prefab"],
				[Bundle_Blocks_VFX.OnHitFire, "@Easy/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitFireVFX.prefab"],
			])}],
		])
	}

	public static readonly Entity:BundleGroup = {
		id: BundleGroupNames.Entity,
		bundles: new Map([
		[Bundle_Entity.OnHit, {
			id: Bundle_Entity.OnHit,
			filePaths: new Map([
				[Bundle_Entity_OnHit.GenericVFX, "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnHitVFX.prefab"],
				[Bundle_Entity_OnHit.DeathVFX, "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVFX.prefab"],
				[Bundle_Entity_OnHit.DeathVoidVFX, "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/OnHit/EntityOnDeathVoidVFX.prefab"],
				[Bundle_Entity_OnHit.FlinchAnimFPS, "@Easy/Core/Shared/Resources/Character/Animations/FP_Flinch.anim"],
				[Bundle_Entity_OnHit.DeathAnimFPS, "@Easy/Core/Shared/Resources/Character/Animations/TP_Death.anim"],
				[Bundle_Entity_OnHit.FlinchAnimTP, "@Easy/Core/Shared/Resources/Character/Animations/TP_Flinch.anim"],
				[Bundle_Entity_OnHit.DeathAnimTP, "@Easy/Core/Shared/Resources/Character/Animations/TP_Death.anim"],
			])}],
		[Bundle_Entity.Movement, {
			id: Bundle_Entity.Movement,
			filePaths: new Map([
				[Bundle_Entity_Movement.SprintTrail, "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/Movement/SprintVFX.prefab"],
				[Bundle_Entity_Movement.LandVFX, "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/Movement/LandingVFX.prefab"],
				[Bundle_Entity_Movement.SprintOverlayVFX, "@Easy/Core/Shared/Resources/Prefabs/VFX/Entity/Movement/SprintOverlayVFX.prefab"],
				[Bundle_Entity_Movement.JumpSFX, "@Easy/Core/Shared/Resources/Sound/Movement/JumpStart.ogg"],
				[Bundle_Entity_Movement.LandSFX, "@Easy/Core/Shared/Resources/Sound/Movement/JumpLand.ogg"],
				[Bundle_Entity_Movement.SlideSFX0, "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_01.wav"],
				[Bundle_Entity_Movement.SlideSFX1, "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_02.wav"],
				[Bundle_Entity_Movement.SlideSFX2, "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_03.wav"],
				[Bundle_Entity_Movement.SlideSFX3, "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Start_04.wav"],
				[Bundle_Entity_Movement.SlideSFXLoop, "@Easy/Core/Shared/Resources/Sound/Movement/s_Movement_Slide_Loop.wav"],
			])}],
		])
	}

	public static readonly ItemBlock:BundleGroup = {
		id: BundleGroupNames.ItemBlock,
		bundles: new Map([
		[Bundle_ItemBlock.FirstPerson, {
			id: Bundle_ItemBlock.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemBlock_FirstPerson.Idle, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim"],
				[Bundle_ItemBlock_FirstPerson.Equip, ""],
				[Bundle_ItemBlock_FirstPerson.UnEquip, ""],
				[Bundle_ItemBlock_FirstPerson.Use01, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use.anim"],
			])}],
		[Bundle_ItemBlock.ThirdPerson, {
			id: Bundle_ItemBlock.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemBlock_ThirdPerson.Idle, ""],
				[Bundle_ItemBlock_ThirdPerson.Equip, ""],
				[Bundle_ItemBlock_ThirdPerson.UnEquip, ""],
				[Bundle_ItemBlock_ThirdPerson.Use, ""],
			])}],
		[Bundle_ItemBlock.Prefabs, {
			id: Bundle_ItemBlock.Prefabs,
			filePaths: new Map([
			])}],
		[Bundle_ItemBlock.SFX, {
			id: Bundle_ItemBlock.SFX,
			filePaths: new Map([
				[Bundle_ItemBlock_SFX.Equip, "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg"],
			])}],
		])
	}

	public static readonly ItemBow:BundleGroup = {
		id: BundleGroupNames.ItemBow,
		bundles: new Map([
		[Bundle_ItemBow.FirstPerson, {
			id: Bundle_ItemBow.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemBow_FirstPerson.Idle, ""],
				[Bundle_ItemBow_FirstPerson.Equip, ""],
				[Bundle_ItemBow_FirstPerson.UnEquip, ""],
				[Bundle_ItemBow_FirstPerson.Charge, ""],
				[Bundle_ItemBow_FirstPerson.Shoot, ""],
			])}],
		[Bundle_ItemBow.ThirdPerson, {
			id: Bundle_ItemBow.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemBow_ThirdPerson.Idle, ""],
				[Bundle_ItemBow_ThirdPerson.Equip, ""],
				[Bundle_ItemBow_ThirdPerson.UnEquip, ""],
				[Bundle_ItemBow_ThirdPerson.Charge, ""],
				[Bundle_ItemBow_ThirdPerson.Shoot, ""],
			])}],
		[Bundle_ItemBow.Prefabs, {
			id: Bundle_ItemBow.Prefabs,
			filePaths: new Map([
			])}],
		[Bundle_ItemBow.SFX, {
			id: Bundle_ItemBow.SFX,
			filePaths: new Map([
				[Bundle_ItemBow_SFX.Equip, "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Bow.ogg"],
				[Bundle_ItemBow_SFX.Charge, "@Easy/Core/Shared/Resources/Sound/Items/Bow/Bow_Charge.ogg"],
			])}],
		])
	}

	public static readonly ItemPickaxe:BundleGroup = {
		id: BundleGroupNames.ItemPickaxe,
		bundles: new Map([
		[Bundle_ItemPickaxe.FirstPerson, {
			id: Bundle_ItemPickaxe.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemPickaxe_FirstPerson.Idle, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim"],
				[Bundle_ItemPickaxe_FirstPerson.Equip, ""],
				[Bundle_ItemPickaxe_FirstPerson.UnEquip, ""],
				[Bundle_ItemPickaxe_FirstPerson.Use01, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use.anim"],
			])}],
		[Bundle_ItemPickaxe.ThirdPerson, {
			id: Bundle_ItemPickaxe.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemPickaxe_ThirdPerson.Idle, ""],
				[Bundle_ItemPickaxe_ThirdPerson.Equip, ""],
				[Bundle_ItemPickaxe_ThirdPerson.UnEquip, ""],
				[Bundle_ItemPickaxe_ThirdPerson.Use, ""],
			])}],
		[Bundle_ItemPickaxe.Prefabs, {
			id: Bundle_ItemPickaxe.Prefabs,
			filePaths: new Map([
				[Bundle_ItemPickaxe_Prefabs.OnUse, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab"],
				[Bundle_ItemPickaxe_Prefabs.OnHit, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab"],
			])}],
		])
	}

	public static readonly ItemSword:BundleGroup = {
		id: BundleGroupNames.ItemSword,
		bundles: new Map([
		[Bundle_ItemSword.FirstPerson, {
			id: Bundle_ItemSword.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemSword_FirstPerson.Idle, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim"],
				[Bundle_ItemSword_FirstPerson.Equip, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim"],
				[Bundle_ItemSword_FirstPerson.Inspect, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Inspect.anim"],
				[Bundle_ItemSword_FirstPerson.Swing01, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use.anim"],
				[Bundle_ItemSword_FirstPerson.Swing02, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Use2.anim"],
			])}],
		[Bundle_ItemSword.ThirdPerson, {
			id: Bundle_ItemSword.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemSword_ThirdPerson.Idle, ""],
				[Bundle_ItemSword_ThirdPerson.Equip, ""],
				[Bundle_ItemSword_ThirdPerson.UnEquip, ""],
				[Bundle_ItemSword_ThirdPerson.Swing01, "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use.anim"],
				[Bundle_ItemSword_ThirdPerson.Swing02, "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use2.anim"],
			])}],
		[Bundle_ItemSword.Prefabs, {
			id: Bundle_ItemSword.Prefabs,
			filePaths: new Map([
				[Bundle_ItemSword_Prefabs.OnSwing01, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX01.prefab"],
				[Bundle_ItemSword_Prefabs.OnSwing02, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX02.prefab"],
				[Bundle_ItemSword_Prefabs.OnSwingFP01, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab"],
				[Bundle_ItemSword_Prefabs.OnSwingFP02, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP02.prefab"],
				[Bundle_ItemSword_Prefabs.OnHit, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab"],
			])}],
		[Bundle_ItemSword.SFX, {
			id: Bundle_ItemSword.SFX,
			filePaths: new Map([
				[Bundle_ItemSword_SFX.Equip, "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Sword.ogg"],
			])}],
		])
	}

	public static readonly ItemSwordBig:BundleGroup = {
		id: BundleGroupNames.ItemSwordBig,
		bundles: new Map([
		[Bundle_ItemSwordBig.FirstPerson, {
			id: Bundle_ItemSwordBig.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemSwordBig_FirstPerson.Idle, "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Idle.anim"],
				[Bundle_ItemSwordBig_FirstPerson.Equip, "@Easy/Core/Shared/Resources/Character/Animations/FP_Sword_Idle.anim"],
				[Bundle_ItemSwordBig_FirstPerson.Inspect, "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Inspect.anim"],
				[Bundle_ItemSwordBig_FirstPerson.Swing01, "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Use.anim"],
				[Bundle_ItemSwordBig_FirstPerson.Swing02, "@Easy/Core/Shared/Resources/Character/Animations/FP_SwordBig_Use2.anim"],
			])}],
		[Bundle_ItemSwordBig.ThirdPerson, {
			id: Bundle_ItemSwordBig.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemSwordBig_ThirdPerson.Idle, ""],
				[Bundle_ItemSwordBig_ThirdPerson.Equip, ""],
				[Bundle_ItemSwordBig_ThirdPerson.UnEquip, ""],
				[Bundle_ItemSwordBig_ThirdPerson.Swing01, "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use.anim"],
				[Bundle_ItemSwordBig_ThirdPerson.Swing02, "@Easy/Core/Shared/Resources/Character/Animations/TP_Sword_Use2.anim"],
			])}],
		[Bundle_ItemSwordBig.Prefabs, {
			id: Bundle_ItemSwordBig.Prefabs,
			filePaths: new Map([
				[Bundle_ItemSwordBig_Prefabs.OnSwing01, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX01.prefab"],
				[Bundle_ItemSwordBig_Prefabs.OnSwing02, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX02.prefab"],
				[Bundle_ItemSwordBig_Prefabs.OnSwingFP01, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab"],
				[Bundle_ItemSwordBig_Prefabs.OnSwingFP02, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP02.prefab"],
				[Bundle_ItemSwordBig_Prefabs.OnHit, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab"],
			])}],
		[Bundle_ItemSwordBig.SFX, {
			id: Bundle_ItemSwordBig.SFX,
			filePaths: new Map([
				[Bundle_ItemSwordBig_SFX.Equip, "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Sword.ogg"],
			])}],
		])
	}

	public static readonly ItemThrowable:BundleGroup = {
		id: BundleGroupNames.ItemThrowable,
		bundles: new Map([
		[Bundle_ItemThrowable.FirstPerson, {
			id: Bundle_ItemThrowable.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemThrowable_FirstPerson.Idle, "@Easy/Core/Shared/Resources/Character/Animations/FP_Generic_Idle.anim"],
				[Bundle_ItemThrowable_FirstPerson.Equip, ""],
				[Bundle_ItemThrowable_FirstPerson.UnEquip, ""],
				[Bundle_ItemThrowable_FirstPerson.Charge, "@Easy/Core/Shared/Resources/Character/Animations/FP_Generic_Charge.anim"],
				[Bundle_ItemThrowable_FirstPerson.Throw, "@Easy/Core/Shared/Resources/Character/Animations/FP_Generic_Throw.anim"],
			])}],
		[Bundle_ItemThrowable.ThirdPerson, {
			id: Bundle_ItemThrowable.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemThrowable_ThirdPerson.Idle, "@Easy/Core/Shared/Resources/Character/Animations/TP_Generic_Idle.anim"],
				[Bundle_ItemThrowable_ThirdPerson.Equip, ""],
				[Bundle_ItemThrowable_ThirdPerson.UnEquip, ""],
				[Bundle_ItemThrowable_ThirdPerson.Charge, "@Easy/Core/Shared/Resources/Character/Animations/TP_Generic_Charge.anim"],
				[Bundle_ItemThrowable_ThirdPerson.Throw, "@Easy/Core/Shared/Resources/Character/Animations/TP_Generic_Throw.anim"],
			])}],
		])
	}

	public static readonly ItemUnarmed:BundleGroup = {
		id: BundleGroupNames.ItemUnarmed,
		bundles: new Map([
		[Bundle_ItemUnarmed.FirstPerson, {
			id: Bundle_ItemUnarmed.FirstPerson,
			filePaths: new Map([
				[Bundle_ItemUnarmed_FirstPerson.Idle, ""],
				[Bundle_ItemUnarmed_FirstPerson.Equip, ""],
				[Bundle_ItemUnarmed_FirstPerson.UnEquip, ""],
				[Bundle_ItemUnarmed_FirstPerson.Use01, ""],
			])}],
		[Bundle_ItemUnarmed.ThirdPerson, {
			id: Bundle_ItemUnarmed.ThirdPerson,
			filePaths: new Map([
				[Bundle_ItemUnarmed_ThirdPerson.Idle, ""],
				[Bundle_ItemUnarmed_ThirdPerson.Equip, ""],
				[Bundle_ItemUnarmed_ThirdPerson.UnEquip, ""],
				[Bundle_ItemUnarmed_ThirdPerson.Use, ""],
			])}],
		[Bundle_ItemUnarmed.Prefabs, {
			id: Bundle_ItemUnarmed.Prefabs,
			filePaths: new Map([
			])}],
		[Bundle_ItemUnarmed.SFX, {
			id: Bundle_ItemUnarmed.SFX,
			filePaths: new Map([
				[Bundle_ItemUnarmed_SFX.Equip, "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg"],
			])}],
		])
	}

	public static readonly HeldItem:BundleGroup = {
		id: BundleGroupNames.HeldItem,
		bundles: new Map([
		[Bundle_HeldItem.OnUse, {
			id: Bundle_HeldItem.OnUse,
			filePaths: new Map([
				[Bundle_HeldItem_OnUse.SwordSwing, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordSwingVFX_FP01.prefab"],
			])}],
		[Bundle_HeldItem.OnHit, {
			id: Bundle_HeldItem.OnHit,
			filePaths: new Map([
				[Bundle_HeldItem_OnHit.SwordHit, "@Easy/Core/Shared/Resources/Prefabs/VFX/Items/Sword/SwordHitVFX.prefab"],
			])}],
		])
	}

	public static readonly Projectiles:BundleGroup = {
		id: BundleGroupNames.Projectiles,
		bundles: new Map([
		[Bundle_Projectiles.OnHitVFX, {
			id: Bundle_Projectiles.OnHitVFX,
			filePaths: new Map([
				[Bundle_Projectiles_OnHitVFX.ArrowHit, "@Easy/Core/Shared/Resources/Prefabs/VFX/Projectiles/OnArrowHitVfx.prefab"],
				[Bundle_Projectiles_OnHitVFX.FireballExplosion, "@Easy/Core/Shared/Resources/Accessories/Weapons/Fireball/FireballOnHitVFX.prefab"],
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
		[BundleGroupNames.ItemSwordBig, ReferenceManagerAssets.ItemSwordBig],
		[BundleGroupNames.ItemThrowable, ReferenceManagerAssets.ItemThrowable],
		[BundleGroupNames.ItemUnarmed, ReferenceManagerAssets.ItemUnarmed],
		[BundleGroupNames.HeldItem, ReferenceManagerAssets.HeldItem],
		[BundleGroupNames.Projectiles, ReferenceManagerAssets.Projectiles],
	]);
}