import Object from "@easy-games/unity-object-utils";
import { Layer } from "Shared/Util/Layer";
import { LayerUtil } from "Shared/Util/LayerUtil";
import { PhysicsUtil } from "Shared/Util/PhysicsUtil";
import { DamageType } from "../Damage/DamageType";
import {
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
	onUseSound: ["Sword_Swing_03.wav"],
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
	onUseSound: ["BowArrowFire"],
	onUseSoundVolume: 0.5,
};

const defaultSwordMelee: MeleeItemMeta = {
	damageType: DamageType.SWORD,
	colliderData: {
		boxHalfWidth: 0.5,
		boxHalfHeight: 0.5,
		boxHalfDepth: 2,
	},
	onHitPrefabId: Bundle_ItemSword_Prefabs.OnHit,
	canHitMultipleTargets: false,
	damage: 5,
};

const defaultBreakBlock: BreakBlockMeta = {
	damage: 1,
	onHitPrefabId: Bundle_ItemPickaxe_Prefabs.OnHit,
	extraDamageBlockArchetype: BlockArchetype.NONE,
	extraDamage: 2,
};

const defaultBlock: BlockMeta = {
	blockId: 0,
	blockArchetype: BlockArchetype.NONE,
	stepSound: ["Footstep_Grass_01", "Footstep_Grass_02", "Footstep_Grass_03", "Footstep_Grass_04"],
};

const woolBlock: BlockMeta = {
	...defaultBlock,
	health: 10,
	blockId: 33,
	stepSound: ["Footstep_Wool_01", "Footstep_Wool_02", "Footstep_Wool_03", "Footstep_Wool_04"],
	placeSound: ["Wool_Place.ogg"],
	hitSound: ["Wool_Hit.ogg"],
	breakSound: ["Wool_Break.ogg"],
	blockArchetype: BlockArchetype.WOOL,
};

const stoneBlock: BlockMeta = {
	...defaultBlock,
	stepSound: ["Footstep_Stone_01", "Footstep_Stone_02", "Footstep_Stone_03", "Footstep_Stone_04"],
};

export const items: {
	[key in ItemType]: Omit<ItemMeta, "ID" | "ItemType">;
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
				path: "Bed/Bed.prefab",
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
	[ItemType.LEATHER_ARMOR]: {
		displayName: "Leather Armor",
		itemMechanics: defaultItemMechanics,
		AccessoryNames: ["Armor/Leather/LeatherArmor", "Armor/Leather/LeatherHelmet"],
		Armor: {
			ArmorType: ArmorType.CHESTPLATE,
			ProtectionAmount: 2,
		},
	},
	[ItemType.IRON_ARMOR]: {
		displayName: "Iron Armor",
		itemMechanics: defaultItemMechanics,
		AccessoryNames: ["Armor/Iron/IronArmor", "Armor/Iron/IronHelmet"],
		Armor: {
			ArmorType: ArmorType.CHESTPLATE,
			ProtectionAmount: 4,
		},
	},
	[ItemType.DIAMOND_ARMOR]: {
		displayName: "Diamond Armor",
		itemMechanics: defaultItemMechanics,
		AccessoryNames: ["Armor/Diamond/DiamondArmor", "Armor/Diamond/DiamondHelmet"],
		Armor: {
			ArmorType: ArmorType.CHESTPLATE,
			ProtectionAmount: 6,
		},
	},
	[ItemType.EMERALD_ARMOR]: {
		displayName: "Emerald Armor",
		itemMechanics: defaultItemMechanics,
		AccessoryNames: ["Armor/Emerald/EmeraldArmor", "Armor/Emerald/EmeraldHelmet"],
		Armor: {
			ArmorType: ArmorType.CHESTPLATE,
			ProtectionAmount: 8,
		},
	},

	////TOOLS
	[ItemType.STONE_PICKAXE]: {
		displayName: "Stone Pickaxe",
		itemAssets: pickaxeItemAssets,
		itemMechanics: {
			...defaultItemMechanics,
			cooldownSeconds: 0.2,
		},
		breakBlock: {
			...defaultBreakBlock,
			damage: 3,
			extraDamageBlockArchetype: BlockArchetype.STONE,
		},
	},

	////SWORDS
	[ItemType.WOOD_SWORD]: {
		displayName: "Wood Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		melee: {
			...defaultSwordMelee,
			damage: 5,
		},
	},
	[ItemType.STONE_SWORD]: {
		displayName: "Stone Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		melee: {
			...defaultSwordMelee,
			damage: 8,
		},
	},
	[ItemType.IRON_SWORD]: {
		displayName: "Iron Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		melee: {
			...defaultSwordMelee,
			damage: 10,
		},
	},
	[ItemType.DIAMOND_SWORD]: {
		displayName: "Diamond Sword",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
		melee: {
			...defaultSwordMelee,
			damage: 13,
		},
	},
	[ItemType.DOUBLE_HIT_SWORD]: {
		displayName: "Double Hit Sword",
		itemAssets: swordItemAssets,
		itemMechanics: { ...swordItemMechanics, cooldownSeconds: 1 },
		melee: {
			...defaultSwordMelee,
			damage: 10,
		},
	},
	[ItemType.RAGEBLADE]: {
		displayName: "Rageblade",
		itemAssets: swordItemAssets,
		itemMechanics: swordItemMechanics,
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
			minChargeSeconds: 0.05,
			maxChargeSeconds: 0.75,
			cooldownSeconds: 0.25,
		},
		itemAssets: bowItemAssets,
		ProjectileLauncher: {
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
		Ammo: {
			yAxisAimAdjust: 0.1,
			damage: 15,
			gravity: defaultGravity * 0.4,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			onHitGroundSoundId: "BowArrowHit",
			onHitGroundSoundVolume: 0.5,
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
		ProjectileLauncher: {
			ammoItemType: ItemType.TELEPEARL,
			minVelocityScaler: 4,
			maxVelocityScaler: 40,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
		},
		Ammo: {
			yAxisAimAdjust: 0.1,
			damage: 15,
			gravity: defaultGravity * 0.2,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
		},
	},
	[ItemType.FIREBALL]: {
		displayName: "Fireball",
		itemMechanics: rangedItemMechanics,
		itemAssets: throwableItemAssets,
		ProjectileLauncher: {
			ammoItemType: ItemType.FIREBALL,
			minVelocityScaler: 15,
			maxVelocityScaler: 15,
			firstPersonLaunchOffset: new Vector3(1.5, 0, 0),
		},
		Ammo: {
			yAxisAimAdjust: 0,
			damage: 30,
			lifetimeSec: 6,
			gravity: 0,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
		},
	},
};
