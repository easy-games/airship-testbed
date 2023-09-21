import { Layer } from "Shared/Util/Layer";
import { LayerUtil } from "Shared/Util/LayerUtil";
import { PhysicsUtil } from "Shared/Util/PhysicsUtil";
import { DamageType } from "../Damage/DamageType";
import {
	AllBundleItems,
	Bundle_ItemPickaxe_Prefabs,
	Bundle_ItemSword_Prefabs,
	BundleGroupNames,
} from "../Util/ReferenceManagerResources";
import { ArmorType } from "./ArmorType";
import {
	BlockArchetype,
	BlockMeta,
	BreakBlockMeta,
	ItemAssetsMeta,
	ItemMechanicsMeta,
	ItemMeta,
	MeleeItemMeta,
} from "./ItemMeta";
import { ItemType } from "./ItemType";

const coreSoundPath = "Imports/Core/Shared/Resources/Sound/";

const defaultGravity = PhysicsUtil.Gravity;
const defaultItemMechanics: ItemMechanicsMeta = {
	startUpInSeconds: 0,
	minChargeSeconds: 0,
	maxChargeSeconds: 0,
	cooldownSeconds: 0.1,
};
const blockItemMechanics: ItemMechanicsMeta = {
	...defaultItemMechanics,
	cooldownSeconds: 0,
};
const blockItemAssets: ItemAssetsMeta = {
	assetBundleId: BundleGroupNames.ItemBlock,
	// onUseSoundId: "GrassBlockPlace",
};
const swordItemMechanics: ItemMechanicsMeta = {
	...defaultItemMechanics,
	cooldownSeconds: 0.15,
};
const swordItemAssets: ItemAssetsMeta = {
	assetBundleId: BundleGroupNames.ItemSword,
	onUsePrefabId: Bundle_ItemSword_Prefabs.OnUse,
	onUseSound: [coreSoundPath + "Sword_Swing_03.wav"],
	onUseSoundVolume: 0.3,
};
const pickaxeItemAssets: ItemAssetsMeta = {
	assetBundleId: BundleGroupNames.ItemPickaxe,
	onUsePrefabId: Bundle_ItemPickaxe_Prefabs.OnUse,
};
const rangedItemMechanics: ItemMechanicsMeta = {
	...defaultItemMechanics,
	cooldownSeconds: 0.1,
	minChargeSeconds: 0.1,
	maxChargeSeconds: 1.5,
};

const throwableItemAssets: ItemAssetsMeta = {
	assetBundleId: BundleGroupNames.ItemThrowable,
	// onUseSoundId: "Throw",
};

const bowItemAssets: ItemAssetsMeta = {
	assetBundleId: BundleGroupNames.ItemBow,
	onUseSound: [coreSoundPath + "BowArrowFire"],
	onUseSoundVolume: 0.5,
};

const defaultSwordMelee: MeleeItemMeta = {
	damageType: DamageType.SWORD,
	onHitPrefabPath: AllBundleItems.ItemSword_Prefabs_OnHit,
	canHitMultipleTargets: false,
	damage: 5,
};

const defaultBreakBlock: BreakBlockMeta = {
	damage: 1,
	onHitPrefabPath: AllBundleItems.ItemPickaxe_Prefabs_OnHit,
	extraDamageBlockArchetype: BlockArchetype.NONE,
	extraDamage: 2,
};

const defaultBlock: BlockMeta = {
	blockId: 0,
	blockArchetype: BlockArchetype.NONE,
	stepSound: [
		coreSoundPath + "Footsteps/Footstep_Grass_01",
		coreSoundPath + "Footsteps/Footstep_Grass_02",
		coreSoundPath + "Footsteps/Footstep_Grass_03",
		coreSoundPath + "Footsteps/Footstep_Grass_04",
	],
};

const woolBlock: BlockMeta = {
	...defaultBlock,
	health: 10,
	blockId: 33,
	stepSound: [
		coreSoundPath + "Footsteps/Footstep_Wool_01",
		coreSoundPath + "Footsteps/Footstep_Wool_02",
		coreSoundPath + "Footsteps/Footstep_Wool_03",
		coreSoundPath + "Footsteps/Footstep_Wool_04",
	],
	placeSound: [coreSoundPath + "Wool_Place.ogg"],
	hitSound: [coreSoundPath + "Wool_Hit.ogg"],
	breakSound: [coreSoundPath + "Wool_Break.ogg"],
	blockArchetype: BlockArchetype.WOOL,
};

const stoneBlock: BlockMeta = {
	...defaultBlock,
	stepSound: [
		coreSoundPath + "Footsteps/Footstep_Stone_01",
		coreSoundPath + "Footsteps/Footstep_Stone_02",
		coreSoundPath + "Footsteps/Footstep_Stone_03",
		coreSoundPath + "Footsteps/Footstep_Stone_04",
	],
};

function AccPath(itemType: ItemType): string {
	return "Imports/Core/Shared/Resources/Accessories/" + itemType.lower() + ".asset";
}

export const items: {
	[key in ItemType]: Omit<ItemMeta, "id" | "itemType">;
} = {
	[ItemType.DEFAULT]: {
		//Identification
		displayName: "Default",
		itemMechanics: defaultItemMechanics,
	},

	////BLOCKS
	[ItemType.BED]: {
		displayName: "Bed",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
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
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...woolBlock,
			blockId: 33,
		},
	},
	[ItemType.BLUE_WOOL]: {
		displayName: "Blue Wool",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...woolBlock,
			blockId: 35,
		},
	},
	[ItemType.RED_WOOL]: {
		displayName: "Red Wool",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...woolBlock,
			blockId: 34,
		},
	},
	[ItemType.GREEN_WOOL]: {
		displayName: "Green Wool",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...woolBlock,
			blockId: 36,
		},
	},
	[ItemType.YELLOW_WOOL]: {
		displayName: "Yellow Wool",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...woolBlock,
			blockId: 37,
		},
	},
	[ItemType.GRASS]: {
		displayName: "Grass",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 1,
		},
	},
	[ItemType.TALL_GRASS]: {
		displayName: "Tall Grass",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 52,
		},
		// Block: {
		// 	HitSound: "GrassBlockHit",
		// 	BreakSound: "GrassBlockBreak",
		// 	PlaceSound: "GrassBlockPlace",
		// },
	},
	[ItemType.DIRT]: {
		displayName: "Dirt",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 2,
		},
	},
	[ItemType.STONE]: {
		displayName: "Stone",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...stoneBlock,
			blockId: 4,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.GRIM_STONE]: {
		displayName: "Grimstone",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 14,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.COBBLESTONE]: {
		displayName: "Cobblestone",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...stoneBlock,
			blockId: 12,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.STONE_BRICK]: {
		displayName: "Stone Brick",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...stoneBlock,
			blockId: 5,
			health: 20,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.OBSIDIAN]: {
		displayName: "Obsidian",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...stoneBlock,
			blockId: 38,
			health: 50,
		},
	},
	[ItemType.ANDESITE]: {
		displayName: "Andesite",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...stoneBlock,
			blockId: 20,
			health: 20,
		},
	},
	[ItemType.OAK_WOOD_PLANK]: {
		displayName: "Oak Wood Plank",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 6,
			blockArchetype: BlockArchetype.WOOD,
		},
	},
	[ItemType.OAK_LOG]: {
		displayName: "Oak Log",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 7,
			blockArchetype: BlockArchetype.WOOD,
		},
	},
	[ItemType.CLAY]: {
		displayName: "Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 54,
		},
	},
	[ItemType.WHITE_CLAY]: {
		displayName: "White Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 55,
		},
	},
	[ItemType.YELLOW_CLAY]: {
		displayName: "Yellow Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 56,
		},
	},
	[ItemType.GRAY_CLAY]: {
		displayName: "Gray Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 58,
		},
	},
	[ItemType.LIGHT_GREEN_CLAY]: {
		displayName: "Light Green Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 21,
		},
	},
	[ItemType.DARK_GREEN_CLAY]: {
		displayName: "Dark Green Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 22,
		},
	},
	[ItemType.BLACK_CLAY]: {
		displayName: "Black Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 57,
		},
	},
	[ItemType.BROWN_CLAY]: {
		displayName: "Brown Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 60,
		},
	},
	[ItemType.LEAF_OAK]: {
		displayName: "Oak Leaf",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 59,
		},
	},
	[ItemType.DIAMOND_BLOCK]: {
		displayName: "Diamond Block",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 28,
		},
	},
	[ItemType.EMERALD_BLOCK]: {
		displayName: "Emerald Block",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 16,
		},
	},
	[ItemType.IRON_BLOCK]: {
		displayName: "Iron Block",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 29,
		},
	},
	[ItemType.MUSHROOM]: {
		displayName: "Mushroom",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...defaultBlock,
			blockId: 50,
		},
	},
	[ItemType.SLATE_BRICK]: {
		displayName: "Slate Brick",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			...defaultBlock,
			blockId: 23,
			health: 20,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.CERAMIC]: {
		displayName: "Ceramic",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			...defaultBlock,
			blockId: 61,
		},
	},

	////RESOURCES
	[ItemType.IRON]: {
		displayName: "Iron",
		itemMechanics: defaultItemMechanics,
	},
	[ItemType.DIAMOND]: {
		displayName: "Diamond",
		itemMechanics: defaultItemMechanics,
	},
	[ItemType.EMERALD]: {
		displayName: "Emerald",
		itemMechanics: defaultItemMechanics,
	},

	////ARMOR
	[ItemType.LEATHER_HELMET]: {
		displayName: "Leather Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Armor/Leather/LeatherHelmet"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 2,
		},
	},
	[ItemType.IRON_HELMET]: {
		displayName: "Iron Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Armor/Iron/IronHelmet"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 4,
		},
	},
	[ItemType.DIAMOND_HELMET]: {
		displayName: "Diamond Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Armor/Diamond/DiamondHelmet"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 6,
		},
	},
	[ItemType.EMERALD_HELMET]: {
		displayName: "Emerald Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Armor/Emerald/EmeraldHelmet"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 8,
		},
	},

	////TOOLS
	[ItemType.WOOD_PICKAXE]: {
		displayName: "Wood Pickaxe",
		itemAssets: pickaxeItemAssets,
		itemMechanics: {
			...defaultItemMechanics,
			cooldownSeconds: 0.2,
		},
		accessoryPaths: [AccPath(ItemType.WOOD_PICKAXE)],
		breakBlock: {
			...defaultBreakBlock,
			damage: 2,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.STONE_PICKAXE]: {
		displayName: "Stone Pickaxe",
		itemAssets: pickaxeItemAssets,
		itemMechanics: {
			...defaultItemMechanics,
			cooldownSeconds: 0.2,
		},
		accessoryPaths: [AccPath(ItemType.STONE_PICKAXE)],
		breakBlock: {
			...defaultBreakBlock,
			damage: 3,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.IRON_PICKAXE]: {
		displayName: "Iron Pickaxe",
		itemAssets: pickaxeItemAssets,
		itemMechanics: {
			...defaultItemMechanics,
			cooldownSeconds: 0.15,
		},
		accessoryPaths: [AccPath(ItemType.IRON_PICKAXE)],
		breakBlock: {
			...defaultBreakBlock,
			damage: 5,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.DIAMOND_PICKAXE]: {
		displayName: "Diamond Pickaxe",
		itemAssets: pickaxeItemAssets,
		itemMechanics: {
			...defaultItemMechanics,
			cooldownSeconds: 0.1,
		},
		accessoryPaths: [AccPath(ItemType.DIAMOND_PICKAXE)],
		breakBlock: {
			...defaultBreakBlock,
			damage: 8,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},

	////SWORDS
	[ItemType.WOOD_SWORD]: {
		displayName: "Wood Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.WOOD_SWORD)],
		melee: {
			...defaultSwordMelee,
			damage: 5,
		},
	},
	[ItemType.STONE_SWORD]: {
		displayName: "Stone Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.STONE_SWORD)],
		melee: {
			...defaultSwordMelee,
			damage: 8,
		},
	},
	[ItemType.IRON_SWORD]: {
		displayName: "Iron Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.IRON_SWORD)],
		melee: {
			...defaultSwordMelee,
			damage: 10,
		},
	},
	[ItemType.DIAMOND_SWORD]: {
		displayName: "Diamond Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.DIAMOND_SWORD)],
		melee: {
			...defaultSwordMelee,
			damage: 13,
		},
	},
	[ItemType.DOUBLE_HIT_SWORD]: {
		displayName: "Double Hit Sword",
		itemAssets: swordItemAssets,
		itemMechanics: { ...swordItemMechanics, cooldownSeconds: 1 },
		accessoryPaths: [AccPath(ItemType.DOUBLE_HIT_SWORD)],
		melee: {
			...defaultSwordMelee,
			damage: 10,
		},
	},
	[ItemType.RAGEBLADE]: {
		displayName: "Rageblade",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.RAGEBLADE)],
		melee: {
			...defaultSwordMelee,
			damage: 15,
		},
	},

	//BOW
	[ItemType.WOOD_BOW]: {
		displayName: "Wood Bow",
		itemMechanics: {
			...rangedItemMechanics,
			minChargeSeconds: 0.12,
			maxChargeSeconds: 0.75,
			cooldownSeconds: 0.25,
		},
		itemAssets: bowItemAssets,
		accessoryPaths: [AccPath(ItemType.WOOD_BOW)],
		projectileLauncher: {
			ammoItemType: ItemType.WOOD_ARROW,
			minVelocityScaler: 5,
			maxVelocityScaler: 100,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
			chargingWalkSpeedMultiplier: 0.25,
		},
	},
	[ItemType.WOOD_ARROW]: {
		displayName: "Wood Arrow",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: [AccPath(ItemType.WOOD_ARROW)],
		ammo: {
			yAxisAimAdjust: 0.1,
			damage: 15,
			gravity: defaultGravity * 0.4,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			onHitGroundSoundId: "BowArrowHitFail",
			onHitEntitySoundId: "BowArrowHitSuccess",
			onHitVFXTemplate: AllBundleItems.Projectiles_OnHitVFX_ArrowHit,
			onHitSoundVolume: 0.5,
		},
	},

	//PROJECTILES
	[ItemType.TELEPEARL]: {
		displayName: "Telepearl",
		itemMechanics: {
			...rangedItemMechanics,
			minChargeSeconds: 0.05,
			maxChargeSeconds: 0.6,
			cooldownSeconds: 0.25,
		},
		itemAssets: {
			...throwableItemAssets,
			onUseSound: ["TelepearlThrow"],
		},
		accessoryPaths: [AccPath(ItemType.TELEPEARL)],
		projectileLauncher: {
			ammoItemType: ItemType.TELEPEARL,
			minVelocityScaler: 4,
			maxVelocityScaler: 40,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
		},
		ammo: {
			yAxisAimAdjust: 0.1,
			damage: 15,
			gravity: defaultGravity * 0.2,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			onHitVFXTemplate: AllBundleItems.Projectiles_OnHitVFX_ArrowHit,
		},
	},
	[ItemType.FIREBALL]: {
		displayName: "Fireball",
		itemMechanics: {
			...rangedItemMechanics,
			minChargeSeconds: 0.05,
			maxChargeSeconds: 0.6,
			cooldownSeconds: 0.25,
		},
		accessoryPaths: [AccPath(ItemType.FIREBALL)],
		itemAssets: {
			...throwableItemAssets,
			onUseSound: ["Fireball_Throw"],
		},
		projectileLauncher: {
			ammoItemType: ItemType.FIREBALL,
			minVelocityScaler: 15,
			maxVelocityScaler: 50,
			firstPersonLaunchOffset: new Vector3(1.5, 0, 0),
		},
		ammo: {
			yAxisAimAdjust: 0,
			damage: 0,
			aoeDamage: {
				innerDamage: 20,
				outerDamage: 1,
				damageRadius: 3.5,
			},
			blockDamage: {
				damage: 20,
				extraDamage: 20,
				extraDamageBlockArchetype: BlockArchetype.WOOD,
				onHitPrefabPath: AllBundleItems.Blocks_VFX_OnHitFire,
			},
			lifetimeSec: 10,
			gravity: defaultGravity * 0.08,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			onHitGroundSoundId: "Fireball_Explosion",
			onHitEntitySoundId: "Fireball_Explosion",
			onHitSoundVolume: 0.5,
			onHitVFXTemplate: AllBundleItems.Projectiles_OnHitVFX_FireballExplosion,
		},
	},
};
