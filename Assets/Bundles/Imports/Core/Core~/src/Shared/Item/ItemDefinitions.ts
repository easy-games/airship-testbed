import { CoreSound } from "Shared/Sound/CoreSound";
import { Layer } from "Shared/Util/Layer";
import { LayerUtil } from "Shared/Util/LayerUtil";
import { PhysicsUtil } from "Shared/Util/PhysicsUtil";
import {
	AllBundleItems,
	Bundle_ItemPickaxe_Prefabs,
	Bundle_ItemSword_Prefabs,
	BundleGroupNames,
} from "../Util/ReferenceManagerResources";
import { ArmorType } from "./ArmorType";
import { BlockArchetype, BlockMeta, BreakBlockMeta, ItemAssetsMeta, ItemMechanicsMeta, ItemMeta } from "./ItemMeta";
import { ItemType } from "./ItemType";

const coreSoundPath = "Imports/Core/Shared/Resources/Sound/";

const defaultGravity = PhysicsUtil.Gravity;
const defaultItemMechanics: ItemMechanicsMeta = {
	startUpInSeconds: 0,
	minChargeSeconds: 0,
	maxChargeSeconds: 0,
	cooldownSeconds: 0.1,
	canHoldToUse: true,
};
const blockItemMechanics: ItemMechanicsMeta = {
	...defaultItemMechanics,
	cooldownSeconds: 0.12,
};
const blockItemAssets: ItemAssetsMeta = {
	assetBundleId: BundleGroupNames.ItemBlock,
	// onUseSoundId: "GrassBlockPlace",
};
const swordItemMechanics: ItemMechanicsMeta = {
	...defaultItemMechanics,
	cooldownSeconds: 0.18,
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

const defaultBreakBlock: BreakBlockMeta = {
	damage: 1,
	onHitPrefabPath: AllBundleItems.ItemPickaxe_Prefabs_OnHit,
	extraDamageBlockArchetype: BlockArchetype.NONE,
	extraDamage: 2,
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
			blockId: 1,
			stepSound: CoreSound.footstepGrass,
		},
	},
	[ItemType.TALL_GRASS]: {
		displayName: "Tall Grass",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
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
			blockId: 2,
			stepSound: CoreSound.footstepGrass,
		},
	},
	[ItemType.STONE]: {
		displayName: "Stone",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 4,
			blockArchetype: BlockArchetype.STONE,
			stepSound: CoreSound.footstepStone,
		},
	},
	[ItemType.GRIM_STONE]: {
		displayName: "Grimstone",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 14,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.COBBLESTONE]: {
		displayName: "Cobblestone",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 12,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.STONE_BRICK]: {
		displayName: "Stone Brick",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			blockId: 26,
			health: 20,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.OBSIDIAN]: {
		displayName: "Obsidian",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			blockId: 38,
			health: 50,
		},
	},
	[ItemType.ANDESITE]: {
		displayName: "Andesite",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			blockId: 20,
			health: 20,
		},
	},
	[ItemType.OAK_WOOD_PLANK]: {
		displayName: "Oak Wood Plank",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 6,
			blockArchetype: BlockArchetype.WOOD,
			stepSound: CoreSound.footstepWood,
		},
	},
	[ItemType.OAK_LOG]: {
		displayName: "Oak Log",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 7,
			blockArchetype: BlockArchetype.WOOD,
			stepSound: CoreSound.footstepWood,
		},
	},
	[ItemType.CLAY]: {
		displayName: "Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 54,
		},
	},
	[ItemType.WHITE_CLAY]: {
		displayName: "White Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 55,
		},
	},
	[ItemType.YELLOW_CLAY]: {
		displayName: "Yellow Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 56,
		},
	},
	[ItemType.GRAY_CLAY]: {
		displayName: "Gray Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 58,
		},
	},
	[ItemType.LIGHT_GREEN_CLAY]: {
		displayName: "Light Green Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 21,
		},
	},
	[ItemType.DARK_GREEN_CLAY]: {
		displayName: "Dark Green Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 22,
		},
	},
	[ItemType.BLACK_CLAY]: {
		displayName: "Black Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 57,
		},
	},
	[ItemType.BROWN_CLAY]: {
		displayName: "Brown Clay",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 60,
		},
	},
	[ItemType.LEAF_OAK]: {
		displayName: "Oak Leaf",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 59,
		},
	},
	[ItemType.DIAMOND_BLOCK]: {
		displayName: "Diamond Block",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 28,
		},
	},
	[ItemType.EMERALD_BLOCK]: {
		displayName: "Emerald Block",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 16,
		},
	},
	[ItemType.IRON_BLOCK]: {
		displayName: "Iron Block",
		itemMechanics: blockItemMechanics,
		itemAssets: blockItemAssets,
		block: {
			blockId: 29,
		},
	},
	[ItemType.MUSHROOM]: {
		displayName: "Mushroom",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
			blockId: 50,
		},
	},
	[ItemType.SLATE_BRICK]: {
		displayName: "Slate Brick",
		itemAssets: blockItemAssets,
		itemMechanics: blockItemMechanics,
		block: {
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
			blockId: 61,
		},
	},

	////RESOURCES
	[ItemType.IRON]: {
		displayName: "Iron",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: [AccPath(ItemType.IRON)],
	},
	[ItemType.DIAMOND]: {
		displayName: "Diamond",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: [AccPath(ItemType.DIAMOND)],
	},
	[ItemType.EMERALD]: {
		displayName: "Emerald",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: [AccPath(ItemType.EMERALD)],
	},

	////ARMOR
	[ItemType.LEATHER_HELMET]: {
		displayName: "Leather Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Leather/LeatherHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 40,
		},
	},
	[ItemType.IRON_HELMET]: {
		displayName: "Iron Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Iron/IronHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 65,
		},
	},
	[ItemType.DIAMOND_HELMET]: {
		displayName: "Diamond Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Diamond/DiamondHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 90,
		},
	},
	[ItemType.EMERALD_HELMET]: {
		displayName: "Emerald Helmet",
		itemMechanics: defaultItemMechanics,
		accessoryPaths: ["Imports/Core/Shared/Resources/Accessories/Armor/Emerald/EmeraldHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 150,
		},
	},

	////TOOLS
	[ItemType.WOOD_PICKAXE]: {
		displayName: "Wood Pickaxe",
		itemAssets: pickaxeItemAssets,
		itemMechanics: {
			...defaultItemMechanics,
			cooldownSeconds: 0.36,
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
			cooldownSeconds: 0.18,
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
			cooldownSeconds: 0.18,
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
			cooldownSeconds: 0.18,
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
			damage: 18,
		},
	},
	[ItemType.STONE_SWORD]: {
		displayName: "Stone Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.STONE_SWORD)],
		melee: {
			damage: 25,
		},
	},
	[ItemType.IRON_SWORD]: {
		displayName: "Iron Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.IRON_SWORD)],
		melee: {
			damage: 35,
		},
	},
	[ItemType.DIAMOND_SWORD]: {
		displayName: "Diamond Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.DIAMOND_SWORD)],
		melee: {
			damage: 45,
		},
	},
	[ItemType.DOUBLE_HIT_SWORD]: {
		displayName: "Double Hit Sword",
		itemAssets: swordItemAssets,
		itemMechanics: { ...swordItemMechanics, cooldownSeconds: 1 },
		accessoryPaths: [AccPath(ItemType.DOUBLE_HIT_SWORD)],
		melee: {
			damage: 10,
		},
	},
	[ItemType.RAGEBLADE]: {
		displayName: "Rageblade",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		accessoryPaths: [AccPath(ItemType.RAGEBLADE)],
		melee: {
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
		itemMechanics: {
			...rangedItemMechanics,
			minChargeSeconds: 0.05,
			maxChargeSeconds: 0.6,
			cooldownSeconds: 0.25,
		},
		itemAssets: {
			...throwableItemAssets,
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
		itemMechanics: {
			...rangedItemMechanics,
			minChargeSeconds: 0.05,
			maxChargeSeconds: 0.6,
			cooldownSeconds: 0.25,
			maxStackSize: 20,
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
		projectile: {
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
