import { DamageType } from "Shared/Damage/DamageType";
import { CoreSound } from "Shared/Sound/CoreSound";
import { Duration } from "Shared/Util/Duration";
import { Layer } from "Shared/Util/Layer";
import { LayerUtil } from "Shared/Util/LayerUtil";
import { PhysicsUtil } from "Shared/Util/PhysicsUtil";
import { AllBundleItems } from "../Util/ReferenceManagerResources";
import { ArmorType } from "./ArmorType";
import { BlockArchetype, BlockMeta, ItemMeta, MeleeItemMeta, UsableHeldItemMeta, ViewModelMeta } from "./ItemMeta";
import { ItemType } from "./ItemType";

const coreSoundPath = "@Easy/Core/Shared/Resources/Sound/";
const CoreAnim = (...p: string[]) => {
	return p.map((s) => {
		if (s === "none") {
			return "none";
		}
		return `@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/${s}.anim`;
	});
};

const GroundItemPrefab = (s: string) => {
	return `@Easy/Core/Shared/Resources/Prefabs/GroundItems/${s}.prefab`;
};

const defaultGravity = PhysicsUtil.Gravity;
const blockUsable: UsableHeldItemMeta = {
	startUpInSeconds: 0,
	minChargeSeconds: 0,
	maxChargeSeconds: 0,
	cooldownSeconds: 0.0,
	holdToUseCooldownInSeconds: 0.16,
	onUseAnimFP: CoreAnim("FP_Block_Place"),
	onUseAnimTP: CoreAnim("TP_Block_Place"),
	canHoldToUse: true,
};
const swordUsable: UsableHeldItemMeta = {
	startUpInSeconds: 0,
	minChargeSeconds: 0,
	maxChargeSeconds: 0,
	cooldownSeconds: 0.25,
	canHoldToUse: false,
	onUseSound: [
		coreSoundPath + "s_Sword_Swing_Wood_01.wav",
		coreSoundPath + "s_Sword_Swing_Wood_02.wav",
		coreSoundPath + "s_Sword_Swing_Wood_03.wav",
		coreSoundPath + "s_Sword_Swing_Wood_04.wav",
	],
	onUseSoundVolume: 0.3,
	onUseAnimFP: [
		AllBundleItems.ItemSword_FirstPerson_Swing01 as string,
		AllBundleItems.ItemSword_FirstPerson_Swing02 as string,
	],
	onUseAnimTP: [
		AllBundleItems.ItemSword_ThirdPerson_Swing01 as string,
		AllBundleItems.ItemSword_ThirdPerson_Swing02 as string,
	],
};
const bigSwordUsable: UsableHeldItemMeta = {
	...swordUsable,
	onUseSoundVolume: 0.4,
	cooldownSeconds: 0.25,
	onUseAnimFP: [
		AllBundleItems.ItemSwordBig_FirstPerson_Swing01 as string,
		AllBundleItems.ItemSwordBig_FirstPerson_Swing02 as string,
	],
	onUseAnimTP: [
		AllBundleItems.ItemSwordBig_ThirdPerson_Swing01 as string,
		AllBundleItems.ItemSwordBig_ThirdPerson_Swing02 as string,
	],
};
const swordViewModel: ViewModelMeta = {
	idleAnimFP: CoreAnim("FP_Sword_Idle"),
	idleAnimTP: CoreAnim("Airship_Empty"),
};

const bigSwordViewModel: ViewModelMeta = {
	// idleAnimFP: CoreAnim("FP_SwordBig_Idle"),
	idleAnimFP: CoreAnim("FP_Sword_Idle"),
	idleAnimTP: CoreAnim("Airship_Empty"),
};

const swordMelee: MeleeItemMeta = {
	damage: 10,
	instantDamage: true,
	hitDelay: 0.1345,
	onHitPrefabPath: AllBundleItems.ItemSword_Prefabs_OnHit as string,
	onUseVFX: [AllBundleItems.ItemSword_Prefabs_OnSwing01, AllBundleItems.ItemSword_Prefabs_OnSwing02],
	onUseVFX_FP: [AllBundleItems.ItemSword_Prefabs_OnSwingFP01, AllBundleItems.ItemSword_Prefabs_OnSwingFP02],
	canHitMultipleTargets: false,
	damageType: DamageType.SWORD,
};
const pickaxeUsable: Partial<UsableHeldItemMeta> = {
	onUseAnimFP: CoreAnim("FP_Sword_Use"),
	onUseAnimTP: CoreAnim("TP_Sword_Use"),
	canHoldToUse: true,
};

const plowUsable: Partial<UsableHeldItemMeta> = {
	onUseAnimFP: CoreAnim("FP_Sword_Use"),
	onUseAnimTP: CoreAnim("TP_Sword_Use"),
};

const seedsUsable: Partial<UsableHeldItemMeta> = {
	onUseAnimFP: CoreAnim("FP_Sword_Use"),
	onUseAnimTP: CoreAnim("TP_Sword_Use"),
};

const pickaxeViewModel: Partial<ViewModelMeta> = {
	idleAnimFP: CoreAnim("FP_Sword_Idle"),
	// idleAnimTP: CoreAnim("TP_Sword_Idle"),
};

const woolBlock: BlockMeta = {
	health: 10,
	blockId: ItemType.WHITE_WOOL,
	stepSound: CoreSound.footstepWool,
	placeSound: CoreSound.blockPlaceWool,
	hitSound: CoreSound.blockHitWool,
	breakSound: CoreSound.blockBreakWool,
	blockArchetype: BlockArchetype.FABRIC,
};

/**
 * Internal use - External use is through `ItemUtil.ItemTypeComponents`.
 *
 * @internal - Will not show up in types
 */
export function ItemTypeComponentsInternal(itemType: ItemType): [scope: string, id: string] {
	const [scope, id] = itemType.split(":");
	if (scope.find("^@([A-z][A-z0-9]+)")[0]) {
		// if scope
		return [scope, id];
	} else {
		return ["", scope];
	}
}

function AccPath(itemType: ItemType): string {
	const [scope, itemId] = ItemTypeComponentsInternal(itemType);

	return scope + "/Shared/Resources/Accessories/" + itemId.lower() + ".asset";
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
			blockId: ItemType.BED,
			prefab: {
				path: "@Easy/Core/Shared/Resources/VoxelWorld/BlockPrefabs/Bed/Bed.prefab",
				childBlocks: [
					new Vector3(0, 0, 1),
					// new Vector3(1, 0, 1),
					// new Vector3(-1, 0, 1),

					// new Vector3(0, 0, 2),
					// new Vector3(1, 0, 2),
					// new Vector3(-1, 0, 2),

					// new Vector3(0, 0, -1),
					// new Vector3(1, 0, -1),
					// new Vector3(-1, 0, -1),

					// new Vector3(1, 0, 0),
					// new Vector3(-1, 0, 0),
				],
			},
			blockArchetype: BlockArchetype.PROP,
		},
	},
	[ItemType.WHITE_WOOL]: {
		displayName: "White Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: ItemType.WHITE_WOOL,
		},
	},
	[ItemType.BLUE_WOOL]: {
		displayName: "Blue Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: ItemType.BLUE_WOOL,
		},
	},
	[ItemType.RED_WOOL]: {
		displayName: "Red Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: ItemType.RED_WOOL,
		},
	},
	[ItemType.GREEN_WOOL]: {
		displayName: "Green Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: ItemType.GREEN_WOOL,
		},
	},
	[ItemType.YELLOW_WOOL]: {
		displayName: "Yellow Wool",
		usable: {
			...blockUsable,
		},
		block: {
			...woolBlock,
			blockId: ItemType.YELLOW_WOOL,
		},
	},
	[ItemType.GRASS]: {
		displayName: "Grass",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.GRASS,
			blockArchetype: BlockArchetype.GROUND,
			tillable: {
				tillsToBlockId: ItemType.FARMLAND, // Farmland
			},
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
			blockId: ItemType.TALL_GRASS,
			blockArchetype: BlockArchetype.GROUND,
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
			blockId: ItemType.DIRT,
			blockArchetype: BlockArchetype.GROUND,
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
			blockId: ItemType.STONE,
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
			blockId: ItemType.GRIM_STONE,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.COBBLESTONE]: {
		displayName: "Cobblestone",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.COBBLESTONE,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.STONE_BRICK]: {
		displayName: "Stone Brick",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.STONE_BRICK,
			health: 32,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.OBSIDIAN]: {
		displayName: "Obsidian",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.OBSIDIAN,
			health: 60,
			blockArchetype: BlockArchetype.HARD_STONE,
		},
	},
	[ItemType.ANDESITE]: {
		displayName: "Andesite",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.ANDESITE,
			health: 20,
			blockArchetype: BlockArchetype.STONE,
		},
	},
	[ItemType.OAK_WOOD_PLANK]: {
		displayName: "Oak Wood Plank",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.OAK_WOOD_PLANK,
			blockArchetype: BlockArchetype.WOOD,
			stepSound: CoreSound.footstepWood,
			health: 24,
		},
	},
	[ItemType.OAK_LOG]: {
		displayName: "Oak Log",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.OAK_LOG,
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
			blockId: ItemType.CLAY,
		},
	},
	[ItemType.WHITE_CLAY]: {
		displayName: "White Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.WHITE_CLAY,
		},
	},
	[ItemType.YELLOW_CLAY]: {
		displayName: "Yellow Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.YELLOW_CLAY,
		},
	},
	[ItemType.GRAY_CLAY]: {
		displayName: "Gray Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.GRAY_CLAY,
		},
	},
	[ItemType.LIGHT_GREEN_CLAY]: {
		displayName: "Light Green Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.LIGHT_GREEN_CLAY,
		},
	},
	[ItemType.DARK_GREEN_CLAY]: {
		displayName: "Dark Green Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.DARK_GREEN_CLAY,
		},
	},
	[ItemType.BLACK_CLAY]: {
		displayName: "Black Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.BLACK_CLAY,
		},
	},
	[ItemType.BROWN_CLAY]: {
		displayName: "Brown Clay",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.BROWN_CLAY,
		},
	},
	[ItemType.OAK_LEAF]: {
		displayName: "Oak Leaf",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.OAK_LEAF,
		},
	},
	[ItemType.DIAMOND_BLOCK]: {
		displayName: "Diamond Block",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.DIAMOND_BLOCK,
		},
	},
	[ItemType.EMERALD_BLOCK]: {
		displayName: "Emerald Block",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.EMERALD_BLOCK,
		},
	},
	[ItemType.IRON_BLOCK]: {
		displayName: "Iron Block",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.IRON_BLOCK,
		},
	},
	[ItemType.MUSHROOM]: {
		displayName: "Mushroom",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.MUSHROOM,
		},
	},
	[ItemType.SLATE_BRICK]: {
		displayName: "Slate Brick",
		usable: {
			...blockUsable,
		},
		block: {
			blockId: ItemType.SLATE_BRICK,
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
			blockId: ItemType.CERAMIC,
			blockArchetype: BlockArchetype.BLAST_PROOF,
		},
	},

	////RESOURCES
	[ItemType.IRON]: {
		displayName: "Iron",
		accessoryPaths: [AccPath(ItemType.IRON)],
		groundItemPrefab: GroundItemPrefab("iron"),
	},
	[ItemType.DIAMOND]: {
		displayName: "Diamond",
		accessoryPaths: [AccPath(ItemType.DIAMOND)],
		groundItemPrefab: GroundItemPrefab("diamond"),
	},
	[ItemType.EMERALD]: {
		displayName: "Emerald",
		accessoryPaths: [AccPath(ItemType.EMERALD)],
		groundItemPrefab: GroundItemPrefab("emerald"),
	},

	////ARMOR
	[ItemType.LEATHER_HELMET]: {
		displayName: "Leather Helmet",
		accessoryPaths: ["@Easy/Core/Shared/Resources/Accessories/Armor/Leather/LeatherHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 40,
		},
	},
	[ItemType.IRON_HELMET]: {
		displayName: "Iron Helmet",
		accessoryPaths: ["@Easy/Core/Shared/Resources/Accessories/Armor/Iron/IronHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 65,
		},
	},
	[ItemType.DIAMOND_HELMET]: {
		displayName: "Diamond Helmet",
		accessoryPaths: ["@Easy/Core/Shared/Resources/Accessories/Armor/Diamond/DiamondHelmet.asset"],
		armor: {
			armorType: ArmorType.HELMET,
			protectionAmount: 90,
		},
	},
	[ItemType.EMERALD_HELMET]: {
		displayName: "Emerald Helmet",
		accessoryPaths: ["@Easy/Core/Shared/Resources/Accessories/Armor/Emerald/EmeraldHelmet.asset"],
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
			...swordMelee,
			damage: 18,
		},
	},
	[ItemType.STONE_SWORD]: {
		displayName: "Stone Sword",
		usable: {
			...swordUsable,
		},
		viewModel: {
			...swordViewModel,
		},
		accessoryPaths: ["@Easy/Core/Shared/Resources/Accessories/stone_sword_temp.asset"],
		melee: {
			...swordMelee,
			damage: 25,
		},
	},
	[ItemType.IRON_SWORD]: {
		displayName: "Iron Sword",
		usable: {
			...swordUsable,
		},
		viewModel: {
			...swordViewModel,
		},
		accessoryPaths: [AccPath(ItemType.IRON_SWORD)],
		melee: {
			...swordMelee,
			damage: 35,
		},
	},
	[ItemType.DIAMOND_SWORD]: {
		displayName: "Diamond Sword",
		usable: {
			...bigSwordUsable,
		},
		viewModel: {
			...bigSwordViewModel,
		},
		accessoryPaths: [AccPath(ItemType.DIAMOND_SWORD)],
		inspectAnimPath: AllBundleItems.ItemSwordBig_FirstPerson_Inspect as string,
		melee: {
			...swordMelee,
			damage: 45,
		},
	},
	[ItemType.EMERALD_SWORD]: {
		displayName: "Emerald Sword",
		usable: {
			...bigSwordUsable,
		},
		viewModel: {
			...bigSwordViewModel,
		},
		accessoryPaths: [AccPath(ItemType.EMERALD_SWORD)],
		inspectAnimPath: AllBundleItems.ItemSwordBig_FirstPerson_Inspect as string,
		melee: {
			...swordMelee,
			damage: 60,
		},
	},
	[ItemType.DOUBLE_HIT_SWORD]: {
		displayName: "Double Hit Sword",
		usable: {
			...swordUsable,
		},
		accessoryPaths: [AccPath(ItemType.DOUBLE_HIT_SWORD)],
		melee: {
			...swordMelee,
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
			...swordMelee,
			damage: 15,
		},
	},

	// BOW & CROSSBOW
	[ItemType.WOOD_BOW]: {
		displayName: "Wood Bow",
		usable: {
			minChargeSeconds: 0.03,
			maxChargeSeconds: 0.75,
			cooldownSeconds: 0.4,
			onUseSound: [CoreSound.bowShoot],
			onUseAnimFP: CoreAnim("FP_Bow_Charge", "FP_Bow_Shoot"),
			onUseAnimTP: CoreAnim("TP_Bow_Charge", "TP_Bow_Shoot"),
		},
		accessoryPaths: [AccPath(ItemType.WOOD_BOW)],
		projectileLauncher: {
			ammoItemType: ItemType.WOOD_ARROW,
			minVelocityScaler: 5,
			maxVelocityScaler: 100,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
			chargingWalkSpeedMultiplier: 0.25,
			chargeSound: [{ path: CoreSound.bowCharge }],
		},
		viewModel: {
			idleAnimFP: CoreAnim("FP_Bow_Idle"),
		},
	},
	[ItemType.WOOD_CROSSBOW]: {
		displayName: "Wood Crossbow",
		usable: {
			minChargeSeconds: 0.12,
			maxChargeSeconds: 0.2,
			cooldownSeconds: 1.15,
			onUseSound: [CoreSound.bowShoot],
			onUseAnimFP: CoreAnim("FP_Crossbow_Charge", "FP_Crossbow_Shoot"),
			onUseAnimTP: CoreAnim("TP_Crossbow_Charge", "TP_Crossbow_Shoot"),
		},
		accessoryPaths: [AccPath(ItemType.WOOD_CROSSBOW)],
		projectileLauncher: {
			ammoItemType: ItemType.WOOD_ARROW,
			minVelocityScaler: 5,
			maxVelocityScaler: 130,
			damageMultiplier: 1.5,
			powerMultiplier: 1.35,
			firstPersonLaunchOffset: new Vector3(1, -0.5, 0),
			chargingWalkSpeedMultiplier: 0.25,
			chargeSound: [{ path: CoreSound.bowCharge }],
		},
		viewModel: {
			idleAnimFP: CoreAnim("FP_Crossbow_Idle"),
			idleAnimTP: CoreAnim("TP_Crossbow_Idle"),
		},
	},
	[ItemType.WOOD_ARROW]: {
		displayName: "Wood Arrow",
		accessoryPaths: [AccPath(ItemType.WOOD_ARROW)],
		projectile: {
			stickItemAtSurfaceOnMiss: true,
			yAxisAimAdjust: 0.1,
			damage: 15,
			gravity: defaultGravity * 0.4,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			onHitEntitySound: [
				{
					path: "@Easy/Core/Shared/Resources/Sound/Items/Projectiles/BowArrowHitSuccess",
					volumeScale: 0.5,
				},
			],
			onHitGroundSound: [
				{
					path: "@Easy/Core/Shared/Resources/Sound/Items/Projectiles/BowArrowHitFail",
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
			maxChargeSeconds: 0.4,
			cooldownSeconds: 0.25,
			onUseSound: ["@Easy/Core/Shared/Resources/Sound/TelepearlThrow"],
			onUseAnimFP: CoreAnim("FP_Generic_Charge", "FP_Generic_Throw"),
			onUseAnimTP: CoreAnim("TP_Generic_Charge", "TP_Generic_Throw"),
		},
		accessoryPaths: [AccPath(ItemType.TELEPEARL)],
		projectileLauncher: {
			ammoItemType: ItemType.TELEPEARL,
			minVelocityScaler: 40,
			maxVelocityScaler: 60,
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
			minChargeSeconds: 0,
			maxChargeSeconds: 0.6,
			cooldownSeconds: 0.25,
			//onUseSound: ["Fireball_Throw"],
			onUseAnimFP: CoreAnim("FP_Generic_Charge", "FP_Generic_Throw"),
			onUseAnimTP: CoreAnim("TP_Generic_Charge", "TP_Generic_Throw"),
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
				innerDamage: 40,
				outerDamage: 5,
				damageRadius: 5,
				blockExplosiveDamage: 60,
				selfKnockbackMultiplier: 1,
			},
			blockDamage: {
				damage: 20,
				extraDamage: 20,
				extraDamageBlockArchetype: BlockArchetype.WOOD,
				onHitPrefabPath: "@Easy/Core/Shared/Resources/Prefabs/VFX/Blocks/OnBlockHitFireVFX.prefab",
			},
			gravity: defaultGravity * 0.09,
			projectileHitLayerMask: LayerUtil.GetLayerMask([Layer.DEFAULT, Layer.BLOCK, Layer.CHARACTER]),
			// onHitGroundSound: [
			// 	{
			// 		path: "@Easy/Core/Shared/Resources/Sound/Items/Projectiles/Fireball_Explosion",
			// 		volumeScale: 0.8,
			// 		rollOffMode: AudioRolloffMode.Logarithmic,
			// 		maxDistance: 700,
			// 	},
			// ],
			onHitVFXTemplate: AllBundleItems.Projectiles_OnHitVFX_FireballExplosion,
		},
	},
	[ItemType.FARMLAND]: {
		displayName: "Farmland",
		block: {
			blockId: ItemType.FARMLAND,
			tillable: {
				tillsToBlockId: ItemType.GRASS, // Grass
			},
			stepSound: CoreSound.footstepGrass,
			hitSound: CoreSound.blockHitDirt,
			breakSound: CoreSound.blockBreakDirt,
			placeSound: CoreSound.blockPlaceDirt,
		},
	},
	[ItemType.PLOW]: {
		displayName: "Plow",
		usable: {
			...plowUsable,
			cooldownSeconds: 0.22,
		},
		viewModel: {
			...pickaxeViewModel,
		},
		accessoryPaths: [AccPath(ItemType.WOOD_PICKAXE)],
		tillBlock: {},
	},
	[ItemType.WHEAT_CROP]: {
		displayName: "Wheat",
		cropBlock: {
			numStages: 4,
			stageGrowthDuration: Duration.fromSeconds(10),
		},
		block: {
			blockId: ItemType.WHEAT_CROP,
			stepSound: CoreSound.footstepGrass,
			hitSound: CoreSound.blockHitDirt,
			breakSound: CoreSound.blockBreakDirt,
			placeSound: CoreSound.blockPlaceDirt,
			prefab: {
				path: "@Easy/Core/Shared/Resources/VoxelWorld/BlockPrefabs/WheatCrop/WheatCrop.prefab",
			},
		},
	},
	[ItemType.WHEAT_SEEDS]: {
		displayName: "Wheat Seeds",
		usable: {
			...seedsUsable,
			cooldownSeconds: 0.22,
		},
		viewModel: {
			...pickaxeViewModel,
		},
		block: {
			blockId: ItemType.WHEAT_CROP,
			placeOnWhitelist: [ItemType.FARMLAND],
			requiresFoundation: true,
		},
		accessoryPaths: [AccPath(ItemType.WHEAT_SEEDS)],
	},
};
