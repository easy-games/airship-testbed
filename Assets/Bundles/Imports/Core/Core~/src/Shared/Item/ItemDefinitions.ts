import { CoreSound } from "Shared/Sound/CoreSound";
import { Layer } from "Shared/Util/Layer";
import { LayerUtil } from "Shared/Util/LayerUtil";
import { PhysicsUtil } from "Shared/Util/PhysicsUtil";
import { AllBundleItems } from "../Util/ReferenceManagerResources";
import { ArmorType } from "./ArmorType";
import { BlockArchetype, BlockMeta, ItemMeta, UsableHeldItemMeta, ViewModelMeta } from "./ItemMeta";
import { ItemType } from "./ItemType";

const coreSoundPath = "Imports/Core/Shared/Resources/Sound/";
const CoreAnim = (...p: string[]) => {
	return p.map((s) => {
		return `Imports/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/${s}.anim`;
	});
};

const defaultGravity = PhysicsUtil.Gravity;
const blockUsable: UsableHeldItemMeta = {
	startUpInSeconds: 0,
	minChargeSeconds: 0,
	maxChargeSeconds: 0,
	cooldownSeconds: 0.0,
	holdToUseCooldownInSeconds: 0.16,
	onUseAnimFP: CoreAnim("FP_Sword_Use"),
	onUseAnimTP: CoreAnim("TP_Block_Place"),
	canHoldToUse: true,
};
const swordUsable: UsableHeldItemMeta = {
	startUpInSeconds: 0,
	minChargeSeconds: 0,
	maxChargeSeconds: 0,
	cooldownSeconds: 0.15,
	canHoldToUse: false,
	onUseSound: [
		coreSoundPath + "s_Sword_Swing_Wood_01.wav",
		coreSoundPath + "s_Sword_Swing_Wood_02.wav",
		coreSoundPath + "s_Sword_Swing_Wood_03.wav",
		coreSoundPath + "s_Sword_Swing_Wood_04.wav",
	],
	onUseSoundVolume: 0.3,
	onUseAnimFP: CoreAnim("FP_Sword_Use"),
	onUseAnimTP: CoreAnim("TP_Sword_Use"),
};
const swordViewModel: ViewModelMeta = {
	idleAnimFP: CoreAnim("FP_Sword_Idle"),
	idleAnimTP: CoreAnim("Airship_Empty"),
};
const pickaxeUsable: Partial<UsableHeldItemMeta> = {
	onUseAnimFP: CoreAnim("FP_Sword_Use"),
	onUseAnimTP: CoreAnim("TP_Sword_Use"),
	canHoldToUse: true,
};
const pickaxeViewModel: Partial<ViewModelMeta> = {
	idleAnimFP: CoreAnim("FP_Sword_Idle"),
	// idleAnimTP: CoreAnim("TP_Sword_Idle"),
};

const woolBlock: BlockMeta = {
	health: 10,
	blockId: 33,
	stepSound: CoreSound.footstepWool,
	placeSound: CoreSound.blockPlaceWool,
	hitSound: CoreSound.blockHitWool,
	breakSound: CoreSound.blockBreakWool,
	blockArchetype: BlockArchetype.WOOL,
};

function AccPath(itemType: ItemType): string {
	return "Imports/Core/Shared/Resources/Accessories/" + itemType.lower() + ".asset";
}

export const items: {
	[key in ItemType]: Omit<ItemMeta, "id" | "itemType">;
} = {
	////BLOCKS
	[ItemType.BED]: {
		displayName: "Bed",
		usable: {
			...blockUsable,
		},
		block: {
			health: 50,
			blockId: 31,
			prefab: {
				path: "Imports/Core/Shared/Resources/VoxelWorld/BlockPrefabs/Bed/Bed.prefab",
				childBlocks: [new Vector3(0, 0, 1)],
			},
			blockArchetype: BlockArchetype.WOOD,
		},
	},
	[ItemType.WHITE_WOOL]: {
		displayName: "White Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: 33,
		},
	},
	[ItemType.BLUE_WOOL]: {
		displayName: "Blue Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: 35,
		},
	},
	[ItemType.RED_WOOL]: {
		displayName: "Red Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: 34,
		},
	},
	[ItemType.GREEN_WOOL]: {
		displayName: "Green Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: 36,
		},
	},
	[ItemType.YELLOW_WOOL]: {
		displayName: "Yellow Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: 37,
		},
	},
	[ItemType.GRASS]: {
		displayName: "Grass",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 1,
			stepSound: CoreSound.footstepGrass,
			hitSound: CoreSound.blockHitDirt,
			breakSound: CoreSound.blockBreakDirt,
			placeSound: CoreSound.blockPlaceDirt,
		},
	},
	[ItemType.TALL_GRASS]: {
		displayName: "Tall Grass",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 52,
			hitSound: CoreSound.blockHitDirt,
			breakSound: CoreSound.blockBreakDirt,
			placeSound: CoreSound.blockPlaceDirt,
		},
	},
	[ItemType.DIRT]: {
		displayName: "Dirt",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 2,
			stepSound: CoreSound.footstepGrass,
			hitSound: CoreSound.blockHitDirt,
			breakSound: CoreSound.blockBreakDirt,
			placeSound: CoreSound.blockPlaceDirt,
		},
	},
	[ItemType.STONE]: {
		displayName: "Stone",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 4,
			blockArchetype: BlockArchetype.STONE,
			stepSound: CoreSound.footstepStone,
		},
	},
	[ItemType.GRIM_STONE]: {
		displayName: "Grimstone",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 14,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.COBBLESTONE]: {
		displayName: "Cobblestone",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 12,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.STONE_BRICK]: {
		displayName: "Stone Brick",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 26,
			health: 20,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.OBSIDIAN]: {
		displayName: "Obsidian",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 38,
			health: 50,
		},
	},
	[ItemType.ANDESITE]: {
		displayName: "Andesite",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 20,
			health: 20,
		},
	},
	[ItemType.OAK_WOOD_PLANK]: {
		displayName: "Oak Wood Plank",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 6,
			blockArchetype: BlockArchetype.WOOD,
			stepSound: CoreSound.footstepWood,
		},
	},
	[ItemType.OAK_LOG]: {
		displayName: "Oak Log",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 7,
			blockArchetype: BlockArchetype.WOOD,
			stepSound: CoreSound.footstepWood,
		},
	},
	[ItemType.CLAY]: {
		displayName: "Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 54,
		},
	},
	[ItemType.WHITE_CLAY]: {
		displayName: "White Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 55,
		},
	},
	[ItemType.YELLOW_CLAY]: {
		displayName: "Yellow Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 56,
		},
	},
	[ItemType.GRAY_CLAY]: {
		displayName: "Gray Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 58,
		},
	},
	[ItemType.LIGHT_GREEN_CLAY]: {
		displayName: "Light Green Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 21,
		},
	},
	[ItemType.DARK_GREEN_CLAY]: {
		displayName: "Dark Green Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 22,
		},
	},
	[ItemType.BLACK_CLAY]: {
		displayName: "Black Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 57,
		},
	},
	[ItemType.BROWN_CLAY]: {
		displayName: "Brown Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 60,
		},
	},
	[ItemType.LEAF_OAK]: {
		displayName: "Oak Leaf",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 59,
		},
	},
	[ItemType.DIAMOND_BLOCK]: {
		displayName: "Diamond Block",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 28,
		},
	},
	[ItemType.EMERALD_BLOCK]: {
		displayName: "Emerald Block",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 16,
		},
	},
	[ItemType.IRON_BLOCK]: {
		displayName: "Iron Block",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 29,
		},
	},
	[ItemType.MUSHROOM]: {
		displayName: "Mushroom",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 50,
		},
	},
	[ItemType.SLATE_BRICK]: {
		displayName: "Slate Brick",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 23,
			health: 20,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.CERAMIC]: {
		displayName: "Ceramic",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: 61,
		},
	},

	////RESOURCES
	[ItemType.IRON]: {
		displayName: "Iron",
		accessoryPaths: [AccPath(ItemType.IRON)],
	},
	[ItemType.DIAMOND]: {
		displayName: "Diamond",
		accessoryPaths: [AccPath(ItemType.DIAMOND)],
	},
	[ItemType.EMERALD]: {
		displayName: "Emerald",
		accessoryPaths: [AccPath(ItemType.EMERALD)],
	},

	////ARMOR
	[ItemType.LEATHER_HELMET]: {
		displayName: "Leather Helmet",
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Leather/LeatherHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 40,
		},
	},
	[ItemType.IRON_HELMET]: {
		displayName: "Iron Helmet",
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Iron/IronHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 65,
		},
	},
	[ItemType.DIAMOND_HELMET]: {
		displayName: "Diamond Helmet",
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Diamond/DiamondHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 90,
		},
	},
	[ItemType.EMERALD_HELMET]: {
		displayName: "Emerald Helmet",
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Emerald/EmeraldHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 150,
		},
	},

	////TOOLS
	[ItemType.WOOD_PICKAXE]: {
		displayName: "Wood Pickaxe",
		usable: {
			...pickaxeUsable,
			cooldownSeconds: 0.22,
		},
		viewModel: {
			...pickaxeViewModel,
		},
		accessoryPaths: [AccPath(ItemType.WOOD_PICKAXE)],
		breakBlock: {
			damage: 2,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.STONE_PICKAXE]: {
		displayName: "Stone Pickaxe",
		usable: {
			...pickaxeUsable,
			cooldownSeconds: 0.2,
		},
		viewModel: {
			...pickaxeViewModel,
		},
		accessoryPaths: [AccPath(ItemType.STONE_PICKAXE)],
		breakBlock: {
			damage: 3,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.IRON_PICKAXE]: {
		displayName: "Iron Pickaxe",
		usable: {
			...pickaxeUsable,
			cooldownSeconds: 0.18,
		},
		viewModel: {
			...pickaxeViewModel,
		},
		accessoryPaths: [AccPath(ItemType.IRON_PICKAXE)],
		breakBlock: {
			damage: 4,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.DIAMOND_PICKAXE]: {
		displayName: "Diamond Pickaxe",
		usable: {
			...pickaxeUsable,
			cooldownSeconds: 0.16,
		},
		viewModel: {
			...pickaxeViewModel,
		},
		accessoryPaths: [AccPath(ItemType.DIAMOND_PICKAXE)],
		breakBlock: {
			damage: 5,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},

	////SWORDS
	[ItemType.WOOD_SWORD]: {
		displayName: "Wood Sword",
		usable: {
			...swordUsable,
		},
		viewModel: {
			...swordViewModel,
		},
		accessoryPaths: [AccPath(ItemType.WOOD_SWORD)],
		melee: {
			damage: 18,
		},
	},
	[ItemType.STONE_SWORD]: {
		displayName: "Stone Sword",
		usable: {
			...swordUsable,
		},
		accessoryPaths: [AccPath(ItemType.STONE_SWORD)],
		melee: {
			damage: 25,
		},
	},
	[ItemType.IRON_SWORD]: {
		displayName: "Iron Sword",
		usable: {
			...swordUsable,
		},
		accessoryPaths: [AccPath(ItemType.IRON_SWORD)],
		melee: {
			damage: 35,
		},
	},
	[ItemType.DIAMOND_SWORD]: {
		displayName: "Diamond Sword",
		usable: {
			...swordUsable,
		},
		accessoryPaths: [AccPath(ItemType.DIAMOND_SWORD)],
		melee: {
			damage: 45,
		},
	},
	[ItemType.DOUBLE_HIT_SWORD]: {
		displayName: "Double Hit Sword",
		usable: {
			...swordUsable,
		},
		accessoryPaths: [AccPath(ItemType.DOUBLE_HIT_SWORD)],
		melee: {
			damage: 10,
		},
	},
	[ItemType.RAGEBLADE]: {
		displayName: "Rageblade",
		usable: {
			...swordUsable,
		},
		accessoryPaths: [AccPath(ItemType.RAGEBLADE)],
		melee: {
			damage: 15,
		},
	},

	// BOW & CROSSBOW
	[ItemType.WOOD_BOW]: {
		displayName: "Wood Bow",
		usable: {
			minChargeSeconds: 0.12,
			maxChargeSeconds: 0.75,
			cooldownSeconds: 0.25,
			onUseSound: [CoreSound.bowShoot],
		},
		accessoryPaths: [AccPath(ItemType.WOOD_BOW)],
		projectileLauncher: {
			ammoItemType: ItemType.WOOD_ARROW,
			minVelocityScaler: 5,
			maxVelocityScaler: 100,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
			chargingWalkSpeedMultiplier: 0.25,
			chargeAnimFP: CoreAnim("FP_Bow_Charge"),
			chargeAnimTP: CoreAnim("TP_Bow_Charge"),
			chargeSound: [{ path: CoreSound.bowCharge }],
		},
		viewModel: {
			idleAnimFP: CoreAnim("FP_Bow_Idle"),
		},
	},
	[ItemType.WOOD_CROSSBOW]: {
		displayName: "Wood Crossbow",
		usable: {
			minChargeSeconds: 0.01,
			maxChargeSeconds: 0.1,
			cooldownSeconds: 1,
			onUseSound: [CoreSound.bowShoot],
		},
		accessoryPaths: [AccPath(ItemType.WOOD_BOW)],
		projectileLauncher: {
			ammoItemType: ItemType.WOOD_ARROW,
			minVelocityScaler: 5,
			maxVelocityScaler: 100,
			damageMultiplier: 1.5,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
			chargingWalkSpeedMultiplier: 0.25,
			chargeAnimFP: CoreAnim("FP_Bow_Charge"),
			chargeAnimTP: CoreAnim("TP_Bow_Charge"),
			chargeSound: [{ path: CoreSound.bowCharge }],
		},
		viewModel: {
			idleAnimFP: CoreAnim("FP_Bow_Idle"),
		},
	},
	[ItemType.WOOD_ARROW]: {
		displayName: "Wood Arrow",
		accessoryPaths: [AccPath(ItemType.WOOD_ARROW)],
		projectile: {
			yAxisAimAdjust: 0.1,
			damage: 15,
			gravity: defaultGravity * 0.4,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			onHitEntitySound: [
				{
					path: "Imports/Core/Shared/Resources/Sound/Items/Projectiles/BowArrowHitSuccess",
					volumeScale: 0.5,
				},
			],
			onHitGroundSound: [
				{
					path: "Imports/Core/Shared/Resources/Sound/Items/Projectiles/BowArrowHitFail",
					volumeScale: 0.7,
					maxDistance: 50,
				},
			],
			onHitVFXTemplate: AllBundleItems.Projectiles_OnHitVFX_ArrowHit,
		},
	},

	//PROJECTILES
	[ItemType.TELEPEARL]: {
		displayName: "Telepearl",
		usable: {
			minChargeSeconds: 0.05,
			maxChargeSeconds: 0.6,
			cooldownSeconds: 0.25,
			onUseSound: ["Imports/Core/Shared/Resources/Sound/TelepearlThrow"],
		},
		accessoryPaths: [AccPath(ItemType.TELEPEARL)],
		projectileLauncher: {
			ammoItemType: ItemType.TELEPEARL,
			minVelocityScaler: 4,
			maxVelocityScaler: 40,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
		},
		projectile: {
			yAxisAimAdjust: 0.1,
			damage: 15,
			gravity: defaultGravity * 0.2,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			onHitVFXTemplate: AllBundleItems.Projectiles_OnHitVFX_ArrowHit,
		},
	},
	[ItemType.FIREBALL]: {
		displayName: "Fireball",
		usable: {
			minChargeSeconds: 0.05,
			maxChargeSeconds: 0.6,
			cooldownSeconds: 0.25,
			onUseSound: ["Fireball_Throw"],
		},
		maxStackSize: 20,
		accessoryPaths: [AccPath(ItemType.FIREBALL)],
		projectileLauncher: {
			ammoItemType: ItemType.FIREBALL,
			minVelocityScaler: 15,
			maxVelocityScaler: 50,
			firstPersonLaunchOffset: new Vector3(1.5, 0, 0),
		},
		projectile: {
			yAxisAimAdjust: 0,
			damage: 0,
			aoeDamage: {
				innerDamage: 20,
				outerDamage: 1,
				damageRadius: 3.5,
				selfKnockbackMultiplier: 1,
			},
			blockDamage: {
				damage: 20,
				extraDamage: 20,
				extraDamageBlockArchetype: BlockArchetype.WOOD,
				onHitPrefabPath: "Imports/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitFireVFX.prefab",
			},
			gravity: defaultGravity * 0.09,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			// onHitGroundSound: [
			// 	{
			// 		path: "Imports/Core/Shared/Resources/Sound/Items/Projectiles/Fireball_Explosion",
			// 		volumeScale: 0.8,
			// 		rollOffMode: AudioRolloffMode.Logarithmic,
			// 		maxDistance: 700,
			// 	},
			// ],
			onHitVFXTemplate: AllBundleItems.Projectiles_OnHitVFX_FireballExplosion,
		},
	},
};
