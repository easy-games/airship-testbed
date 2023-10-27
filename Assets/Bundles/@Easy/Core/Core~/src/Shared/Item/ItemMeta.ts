import { PlaySoundConfig } from "Shared/Audio/AudioManager";
import { Entity } from "Shared/Entity/Entity";
import { DamageType } from "../Damage/DamageType";
import { AllBundleItems } from "../Util/ReferenceManagerResources";
import { ArmorType } from "./ArmorType";
import { ItemType } from "./ItemType";
import { Duration } from "Shared/Util/Duration";

export interface TillableBlockMeta {
	tillsToBlockId: number;
}

export interface BlockMeta {
	health?: number;
	blockId: number;
	tillable?: TillableBlockMeta;
	blockArchetype?: BlockArchetype;
	prefab?: {
		path: string;
		childBlocks?: Vector3[];
	};
	placeSound?: string[];
	stepSound?: string[];
	hitSound?: string[];
	breakSound?: string[];
}

export type SoundMeta = { path: string } & PlaySoundConfig;

export interface AmmoMeta {
	projectileHitLayerMask: number;
	yAxisAimAdjust: number;
	damage: number;
	aoeDamage?: AOEDamageMeta;
	blockDamage?: BreakBlockMeta;
	lifetimeSec?: number;
	gravity: number;
	onHitEntitySound?: SoundMeta[];
	onHitGroundSound?: SoundMeta[];
	onHitVFXTemplate: AllBundleItems;
}

export interface HitSignal {
	Position: Vector3;
	Velocity: Vector3;
	HitEntity: Entity | undefined;
	AmmoItemType: ItemType;
}

export interface ProjectileLauncherMeta {
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
	chargeSound?: SoundMeta[];
	chargeAnimFP?: string[];
	chargeAnimTP?: string[];
}

export interface ViewModelMeta {
	idleAnimFP?: string[];
	idleAnimTP?: string[];
	equipAnimFP?: string[];
	equipAnimTP?: string[];
	unequipAnimFP?: string[];
	unequipAnimTP?: string[];
	equipSound?: string[];
}

export interface PlaceBlockMeta {
	/**
	 * The type of item to place instead - must be a block!
	 */
	placementBlock?: ItemType;
	/**
	 * A filter for what this can be placed on
	 */
	placeOnBlockWhitelist?: ItemType[];
}

export interface CropBlockMeta {
	numStages: number;
	stageGrowthDuration: Duration;
}

export interface ItemMeta {
	//Identification
	displayName: string;
	id: number;
	itemType: ItemType;

	/** Path to image. */
	image?: string;

	usable?: UsableHeldItemMeta;
	viewModel?: ViewModelMeta;

	maxStackSize?: number;

	//Optional Item Archetypes
	melee?: MeleeItemMeta;
	block?: BlockMeta;
	breakBlock?: BreakBlockMeta;
	cropBlock?: CropBlockMeta;
	tillBlock?: TillBlockMeta;
	/**
	 * override what block placing places, or requires
	 */
	placeBlock?: PlaceBlockMeta;
	accessoryPaths?: string[];
	projectileLauncher?: ProjectileLauncherMeta;
	projectile?: AmmoMeta;
	armor?: {
		armorType: ArmorType;
		protectionAmount: number;
	};
	pickupSound?: string[];
}

export interface UsableHeldItemMeta {
	minChargeSeconds?: number;
	maxChargeSeconds?: number;
	startUpInSeconds?: number;
	cooldownSeconds: number;
	canHoldToUse?: boolean;
	holdToUseCooldownInSeconds?: number;
	maxStackSize?: number;
	onUseSound?: string[];
	onUseSoundVolume?: number;
	onUseAnimFP?: string[];
	onUseAnimTP?: string[];
}

export interface TillBlockMeta {}

export interface BreakBlockMeta {
	extraDamageBlockArchetype?: BlockArchetype;
	extraDamage?: number;

	damage: number;

	/**
	 * If undefined, default effects will be used.
	 */
	onHitPrefabPath?: string;
}

export interface AOEDamageMeta {
	innerDamage: number;
	outerDamage: number;
	damageRadius: number;
	selfKnockbackMultiplier?: number;
}

export enum BlockArchetype {
	NONE,
	STONE,
	WOOD,
	WOOL,
}

export interface MeleeItemMeta {
	damageType?: DamageType;
	canHitMultipleTargets?: boolean;
	damage: number;

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
