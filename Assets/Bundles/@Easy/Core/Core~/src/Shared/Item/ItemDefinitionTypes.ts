import { PlaySoundConfig } from "Shared/Audio/AudioManager";
import { Entity } from "Shared/Entity/Entity";
import { Duration } from "Shared/Util/Duration";
import { DamageType } from "../Damage/DamageType";
import { AllBundleItems } from "../Util/ReferenceManagerResources";
import { ArmorType } from "./ArmorType";
import { ItemType } from "./ItemType";

export interface TillableBlockDef {
	tillsToBlockId: string;
}

export interface BlockDef {
	health?: number;
	blockId: string;
	tillable?: TillableBlockDef;
	blockArchetype?: BlockArchetype;
	prefab?: {
		path: string;
		childBlocks?: Vector3[];
	};
	placeSound?: string[];
	stepSound?: string[];
	hitSound?: string[];
	breakSound?: string[];

	/**
	 * A filter for what this block can be placed on
	 */
	placeOnWhitelist?: ItemType[];
	/**
	 * If this block requires a block underneath it
	 */
	requiresFoundation?: boolean;
}

export type SoundDef = { path: string } & PlaySoundConfig;

export interface AmmoDef {
	projectileHitLayerMask: number;
	yAxisAimAdjust: number;
	damage: number;
	aoeDamage?: AOEDamageDef;
	blockDamage?: BreakBlockDef;
	lifetimeSec?: number;
	gravity: number;
	/**
	 * Will "stick" a ground item inside whatever was piereced on miss (e.g. arrows in blocks)
	 */
	stickItemAtSurfaceOnMiss?: boolean;
	onHitEntitySound?: SoundDef[];
	onHitGroundSound?: SoundDef[];
	onHitVFXTemplate: AllBundleItems;
}

export interface HitSignal {
	Position: Vector3;
	Velocity: Vector3;
	HitEntity: Entity | undefined;
	AmmoItemType: ItemType;
}

export interface ProjectileLauncherDef {
	ammoItemType: ItemType;
	minVelocityScaler: number;
	maxVelocityScaler: number;
	/**
	 * Modifies the DIRECT damage of any projectile fired from this launcher
	 */
	damageMultiplier?: number;
	/**
	 * Modifies the strength (and thus affects gravity) of any projectiles from this launcher (and thus may lessen an arc)
	 */
	powerMultiplier?: number;
	chargingWalkSpeedMultiplier?: number;
	firstPersonLaunchOffset: Vector3;
	chargeSound?: SoundDef[];
}

export interface ViewModelDef {
	idleAnimFP?: string[];
	idleAnimTP?: string[];
	equipAnimFP?: string[];
	equipAnimTP?: string[];
	unequipAnimFP?: string[];
	unequipAnimTP?: string[];
	equipSound?: string[];
}

export interface CropBlockDef {
	numStages: number;
	stageGrowthDuration: Duration;
}

export interface ItemDef {
	//Identification
	displayName: string;
	id: number;
	itemType: ItemType;

	/** Path to image. */
	image?: string;

	usable?: UsableHeldItemDef;
	viewModel?: ViewModelDef;

	maxStackSize?: number;
	inspectAnimPath?: string;

	//Optional Item Archetypes
	melee?: MeleeItemDef;
	block?: BlockDef;
	breakBlock?: BreakBlockDef;
	cropBlock?: CropBlockDef;
	tillBlock?: TillBlockDef;
	accessoryPaths?: string[];
	projectileLauncher?: ProjectileLauncherDef;
	projectile?: AmmoDef;
	armor?: {
		armorType: ArmorType;
		protectionAmount: number;
	};
	pickupSound?: string[];
	groundItemPrefab?: string;
}

export interface UsableHeldItemDef {
	minChargeSeconds?: number;
	maxChargeSeconds?: number;
	startUpInSeconds?: number;
	cooldownSeconds: number;
	canHoldToUse?: boolean;
	holdToUseCooldownInSeconds?: number;
	maxStackSize?: number;
	onUseSound?: string[];
	onUseSoundVolume?: number;

	/**
	 * First element charge animation.
	 * Second element is shoot animation.
	 */
	onUseAnimFP?: string[];

	/**
	 * First element charge animation.
	 * Second element is shoot animation.
	 */
	onUseAnimTP?: string[];
}

export interface TillBlockDef {}

export interface BreakBlockDef {
	extraDamageBlockArchetype?: BlockArchetype;
	extraDamage?: number;

	damage: number;

	/**
	 * If undefined, default effects will be used.
	 */
	onHitPrefabPath?: string;
	damageType?: BlockDamageType;
}

export enum BlockDamageType {
	NORMAL,
	BLAST,
}

export interface AOEDamageDef {
	innerDamage: number;
	outerDamage: number;
	damageRadius: number;
	blockExplosiveDamage: number;
	selfKnockbackMultiplier?: number;
}

export enum BlockArchetype {
	NONE = -1,
	PROP = 0,
	GROUND,
	FABRIC,
	WOOD,
	STONE,
	HARD_STONE,
	METAL,
	BLAST_PROOF,
}

export interface MeleeItemDef {
	damageType?: DamageType;
	canHitMultipleTargets?: boolean;
	damage: number;
	instantDamage?: boolean;
	hitDelay?: number;
	onUseVFX: AllBundleItems[];
	onUseVFX_FP: AllBundleItems[];
	/**
	 * If undefined, default effects will be used.
	 */
	onHitPrefabPath?: string;
}

export interface BoxCollision {
	boxHalfWidth: number;
	boxHalfHeight: number;
	boxHalfDepth: number;
	localPositionOffsetX?: number;
	localPositionOffsetY?: number;
	localPositionOffsetZ?: number;
}
