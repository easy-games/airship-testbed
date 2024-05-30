import { PlaySoundConfig } from "@Easy/Core/Shared/Audio/AudioManager";
import { Duration } from "@Easy/Core/Shared/Util/Duration";
import { DamageType } from "../Damage/DamageType";
import { ArmorType } from "./ArmorType";
import { CoreItemType } from "./CoreItemType";

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
	placeOnWhitelist?: CoreItemType[];
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
	destroyTrailImmediately?: boolean;
	gravity: number;
	/**
	 * Will "stick" a ground item inside whatever was piereced on miss (e.g. arrows in blocks)
	 */
	stickItemAtSurfaceOnMiss?: boolean;
	onHitEntitySound?: SoundDef[];
	onHitGroundSound?: SoundDef[];
	prefabPath: string;
	onHitVFXTemplate: string;
}

export interface ProjectileLauncherDef {
	ammoItemType: CoreItemType;
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

export interface HoldConfig {
	worldmodel?: {
		idleAnim?: string[];
		equipAnim?: string[];
		unequipAnim?: string[];
	};
	viewmodel?: {
		idleAnim?: string[];
		equipAnim?: string[];
		unequipAnim?: string[];
	};
	equipSound?: string[];
}

export interface CropBlockDef {
	numStages: number;
	stageGrowthDuration: Duration;
}

export interface ItemDef {
	//Identification
	displayName: string;
	/**
	 * Runtime ID. This may change between sessions.
	 * For a consistent ID, you should use {@link itemType}.
	 */
	id: number;
	itemType: string;

	/** Path to image. */
	image?: string;

	usable?: UsableHeldItemDef;
	holdConfig?: HoldConfig;

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
	onUseAnimViewmodel?: string[];

	/**
	 * First element charge animation.
	 * Second element is shoot animation.
	 */
	onUseAnimWorldmodel?: string[];
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
	onUseVFX: string[];
	onUseVFX_FP: string[];
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
