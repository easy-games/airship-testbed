-- Compiled with unity-ts v2.1.0-75
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local LayerUtil = require("Shared/TS/Util/LayerUtil").LayerUtil
local PhysicsUtil = require("Shared/TS/Util/PhysicsUtil").PhysicsUtil
local DamageType = require("Shared/TS/Damage/DamageType").DamageType
local _ReferenceManagerResources = require("Shared/TS/Util/ReferenceManagerResources")
local Bundle_ItemPickaxe_Prefabs = _ReferenceManagerResources.Bundle_ItemPickaxe_Prefabs
local Bundle_ItemSword_Prefabs = _ReferenceManagerResources.Bundle_ItemSword_Prefabs
local BundleGroupNames = _ReferenceManagerResources.BundleGroupNames
local ArmorType = require("Shared/TS/Item/ArmorType").ArmorType
local BlockArchetype = require("Shared/TS/Item/ItemMeta").BlockArchetype
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local defaultGravity = PhysicsUtil.Gravity
local defaultItemMechanics = {
	startUpInSeconds = 0,
	minChargeSeconds = 0,
	maxChargeSeconds = 0,
	cooldownSeconds = 0.1,
}
local _object = {}
for _k, _v in defaultItemMechanics do
	_object[_k] = _v
end
_object.cooldownSeconds = 0
local blockItemMechanics = _object
local blockItemAssets = {
	assetBundleId = BundleGroupNames.ItemBlock,
}
local _object_1 = {}
for _k, _v in defaultItemMechanics do
	_object_1[_k] = _v
end
_object_1.cooldownSeconds = 0.2
local swordItemMechanics = _object_1
local swordItemAssets = {
	assetBundleId = BundleGroupNames.ItemSword,
	onUsePrefabId = Bundle_ItemSword_Prefabs.OnUse,
	onUseSoundId = "Sword_Swing_03.wav",
	onUseSoundVolume = 0.3,
}
local pickaxeItemAssets = {
	assetBundleId = BundleGroupNames.ItemPickaxe,
	onUsePrefabId = Bundle_ItemPickaxe_Prefabs.OnUse,
}
local _object_2 = {}
for _k, _v in defaultItemMechanics do
	_object_2[_k] = _v
end
_object_2.cooldownSeconds = 0.1
_object_2.minChargeSeconds = 0.1
_object_2.maxChargeSeconds = 1.5
local rangedItemMechanics = _object_2
local throwableItemAssets = {
	assetBundleId = BundleGroupNames.ItemThrowable,
}
local defaultSwordMelee = {
	damageType = DamageType.SWORD,
	colliderData = {
		boxHalfWidth = 1.5,
		boxHalfHeight = 1.8,
		boxHalfDepth = 1.9,
	},
	onHitPrefabId = Bundle_ItemSword_Prefabs.OnHit,
	canHitMultipleTargets = false,
	damage = 5,
}
local defaultBreakBlock = {
	damage = 1,
	onHitPrefabId = Bundle_ItemPickaxe_Prefabs.OnHit,
	extraDamageBlockArchetype = BlockArchetype.NONE,
	extraDamage = 2,
}
local defaultBlock = {
	blockId = 0,
	blockArchetype = BlockArchetype.NONE,
	stepSound = { "Footstep_Grass_01", "Footstep_Grass_02", "Footstep_Grass_03", "Footstep_Grass_04" },
}
local _object_3 = {}
for _k, _v in defaultBlock do
	_object_3[_k] = _v
end
_object_3.health = 10
_object_3.blockId = 33
_object_3.stepSound = { "Footstep_Wool_01", "Footstep_Wool_02", "Footstep_Wool_03", "Footstep_Wool_04" }
_object_3.placeSound = { "Wool_Place.ogg" }
_object_3.hitSound = { "Wool_Hit.ogg" }
_object_3.breakSound = { "Wool_Break.ogg" }
_object_3.blockArchetype = BlockArchetype.WOOL
local woolBlock = _object_3
local _object_4 = {}
for _k, _v in defaultBlock do
	_object_4[_k] = _v
end
_object_4.stepSound = { "Footstep_Stone_01", "Footstep_Stone_02", "Footstep_Stone_03", "Footstep_Stone_04" }
local stoneBlock = _object_4
local _object_5 = {
	[ItemType.DEFAULT] = {
		displayName = "Default",
		itemMechanics = defaultItemMechanics,
	},
}
local _left = ItemType.BED
local _object_6 = {
	displayName = "Bed",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_1 = "block"
local _object_7 = {}
for _k, _v in defaultBlock do
	_object_7[_k] = _v
end
_object_7.health = 50
_object_7.blockId = 31
_object_7.prefab = {
	path = "Bed/Bed.prefab",
	childBlocks = { Vector3.new(0, 0, 1) },
}
_object_7.blockArchetype = BlockArchetype.WOOD
_object_6[_left_1] = _object_7
_object_5[_left] = _object_6
local _left_2 = ItemType.WHITE_WOOL
local _object_8 = {
	displayName = "White Wool",
	itemAssets = blockItemAssets,
	itemMechanics = blockItemMechanics,
}
local _left_3 = "block"
local _object_9 = {}
for _k, _v in woolBlock do
	_object_9[_k] = _v
end
_object_9.blockId = 33
_object_8[_left_3] = _object_9
_object_5[_left_2] = _object_8
local _left_4 = ItemType.BLUE_WOOL
local _object_10 = {
	displayName = "Blue Wool",
	itemAssets = blockItemAssets,
	itemMechanics = blockItemMechanics,
}
local _left_5 = "block"
local _object_11 = {}
for _k, _v in woolBlock do
	_object_11[_k] = _v
end
_object_11.blockId = 35
_object_10[_left_5] = _object_11
_object_5[_left_4] = _object_10
local _left_6 = ItemType.GRASS
local _object_12 = {
	displayName = "Grass",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_7 = "block"
local _object_13 = {}
for _k, _v in defaultBlock do
	_object_13[_k] = _v
end
_object_13.blockId = 1
_object_12[_left_7] = _object_13
_object_5[_left_6] = _object_12
local _left_8 = ItemType.TALL_GRASS
local _object_14 = {
	displayName = "Tall Grass",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_9 = "block"
local _object_15 = {}
for _k, _v in defaultBlock do
	_object_15[_k] = _v
end
_object_15.blockId = 52
_object_14[_left_9] = _object_15
_object_5[_left_8] = _object_14
local _left_10 = ItemType.DIRT
local _object_16 = {
	displayName = "Dirt",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_11 = "block"
local _object_17 = {}
for _k, _v in defaultBlock do
	_object_17[_k] = _v
end
_object_17.blockId = 2
_object_16[_left_11] = _object_17
_object_5[_left_10] = _object_16
local _left_12 = ItemType.STONE
local _object_18 = {
	displayName = "Stone",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_13 = "block"
local _object_19 = {}
for _k, _v in stoneBlock do
	_object_19[_k] = _v
end
_object_19.blockId = 4
_object_19.blockArchetype = BlockArchetype.STONE
_object_18[_left_13] = _object_19
_object_5[_left_12] = _object_18
local _left_14 = ItemType.GRIM_STONE
local _object_20 = {
	displayName = "Grimstone",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_15 = "block"
local _object_21 = {}
for _k, _v in defaultBlock do
	_object_21[_k] = _v
end
_object_21.blockId = 14
_object_21.blockArchetype = BlockArchetype.STONE
_object_20[_left_15] = _object_21
_object_5[_left_14] = _object_20
local _left_16 = ItemType.COBBLESTONE
local _object_22 = {
	displayName = "Cobblestone",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_17 = "block"
local _object_23 = {}
for _k, _v in stoneBlock do
	_object_23[_k] = _v
end
_object_23.blockId = 12
_object_23.blockArchetype = BlockArchetype.STONE
_object_22[_left_17] = _object_23
_object_5[_left_16] = _object_22
local _left_18 = ItemType.STONE_BRICK
local _object_24 = {
	displayName = "Stone Brick",
	itemAssets = blockItemAssets,
	itemMechanics = blockItemMechanics,
}
local _left_19 = "block"
local _object_25 = {}
for _k, _v in stoneBlock do
	_object_25[_k] = _v
end
_object_25.blockId = 5
_object_25.health = 20
_object_25.blockArchetype = BlockArchetype.STONE
_object_24[_left_19] = _object_25
_object_5[_left_18] = _object_24
local _left_20 = ItemType.OBSIDIAN
local _object_26 = {
	displayName = "Obsidian",
	itemAssets = blockItemAssets,
	itemMechanics = blockItemMechanics,
}
local _left_21 = "block"
local _object_27 = {}
for _k, _v in stoneBlock do
	_object_27[_k] = _v
end
_object_27.blockId = 38
_object_27.health = 50
_object_26[_left_21] = _object_27
_object_5[_left_20] = _object_26
local _left_22 = ItemType.ANDESITE
local _object_28 = {
	displayName = "Andesite",
	itemAssets = blockItemAssets,
	itemMechanics = blockItemMechanics,
}
local _left_23 = "block"
local _object_29 = {}
for _k, _v in stoneBlock do
	_object_29[_k] = _v
end
_object_29.blockId = 20
_object_29.health = 20
_object_28[_left_23] = _object_29
_object_5[_left_22] = _object_28
local _left_24 = ItemType.OAK_WOOD_PLANK
local _object_30 = {
	displayName = "Oak Wood Plank",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_25 = "block"
local _object_31 = {}
for _k, _v in defaultBlock do
	_object_31[_k] = _v
end
_object_31.blockId = 6
_object_31.blockArchetype = BlockArchetype.WOOD
_object_30[_left_25] = _object_31
_object_5[_left_24] = _object_30
local _left_26 = ItemType.OAK_LOG
local _object_32 = {
	displayName = "Oak Log",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_27 = "block"
local _object_33 = {}
for _k, _v in defaultBlock do
	_object_33[_k] = _v
end
_object_33.blockId = 7
_object_33.blockArchetype = BlockArchetype.WOOD
_object_32[_left_27] = _object_33
_object_5[_left_26] = _object_32
local _left_28 = ItemType.CLAY
local _object_34 = {
	displayName = "Clay",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_29 = "block"
local _object_35 = {}
for _k, _v in defaultBlock do
	_object_35[_k] = _v
end
_object_35.blockId = 54
_object_34[_left_29] = _object_35
_object_5[_left_28] = _object_34
local _left_30 = ItemType.WHITE_CLAY
local _object_36 = {
	displayName = "White Clay",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_31 = "block"
local _object_37 = {}
for _k, _v in defaultBlock do
	_object_37[_k] = _v
end
_object_37.blockId = 55
_object_36[_left_31] = _object_37
_object_5[_left_30] = _object_36
local _left_32 = ItemType.YELLOW_CLAY
local _object_38 = {
	displayName = "Yellow Clay",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_33 = "block"
local _object_39 = {}
for _k, _v in defaultBlock do
	_object_39[_k] = _v
end
_object_39.blockId = 56
_object_38[_left_33] = _object_39
_object_5[_left_32] = _object_38
local _left_34 = ItemType.GRAY_CLAY
local _object_40 = {
	displayName = "Gray Clay",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_35 = "block"
local _object_41 = {}
for _k, _v in defaultBlock do
	_object_41[_k] = _v
end
_object_41.blockId = 58
_object_40[_left_35] = _object_41
_object_5[_left_34] = _object_40
local _left_36 = ItemType.LIGHT_GREEN_CLAY
local _object_42 = {
	displayName = "Light Green Clay",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_37 = "block"
local _object_43 = {}
for _k, _v in defaultBlock do
	_object_43[_k] = _v
end
_object_43.blockId = 21
_object_42[_left_37] = _object_43
_object_5[_left_36] = _object_42
local _left_38 = ItemType.DARK_GREEN_CLAY
local _object_44 = {
	displayName = "Dark Green Clay",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_39 = "block"
local _object_45 = {}
for _k, _v in defaultBlock do
	_object_45[_k] = _v
end
_object_45.blockId = 22
_object_44[_left_39] = _object_45
_object_5[_left_38] = _object_44
local _left_40 = ItemType.BLACK_CLAY
local _object_46 = {
	displayName = "Black Clay",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_41 = "block"
local _object_47 = {}
for _k, _v in defaultBlock do
	_object_47[_k] = _v
end
_object_47.blockId = 57
_object_46[_left_41] = _object_47
_object_5[_left_40] = _object_46
local _left_42 = ItemType.DIAMOND_BLOCK
local _object_48 = {
	displayName = "Diamond Block",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_43 = "block"
local _object_49 = {}
for _k, _v in defaultBlock do
	_object_49[_k] = _v
end
_object_49.blockId = 28
_object_48[_left_43] = _object_49
_object_5[_left_42] = _object_48
local _left_44 = ItemType.EMERALD_BLOCK
local _object_50 = {
	displayName = "Emerald Block",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_45 = "block"
local _object_51 = {}
for _k, _v in defaultBlock do
	_object_51[_k] = _v
end
_object_51.blockId = 16
_object_50[_left_45] = _object_51
_object_5[_left_44] = _object_50
local _left_46 = ItemType.IRON_BLOCK
local _object_52 = {
	displayName = "Iron Block",
	itemMechanics = blockItemMechanics,
	itemAssets = blockItemAssets,
}
local _left_47 = "block"
local _object_53 = {}
for _k, _v in defaultBlock do
	_object_53[_k] = _v
end
_object_53.blockId = 29
_object_52[_left_47] = _object_53
_object_5[_left_46] = _object_52
local _left_48 = ItemType.MUSHROOM
local _object_54 = {
	displayName = "Mushroom",
	itemAssets = blockItemAssets,
	itemMechanics = blockItemMechanics,
}
local _left_49 = "block"
local _object_55 = {}
for _k, _v in defaultBlock do
	_object_55[_k] = _v
end
_object_55.blockId = 50
_object_54[_left_49] = _object_55
_object_5[_left_48] = _object_54
local _left_50 = ItemType.SLATE_BRICK
local _object_56 = {
	displayName = "Slate Brick",
	itemAssets = blockItemAssets,
	itemMechanics = blockItemMechanics,
}
local _left_51 = "block"
local _object_57 = {}
for _k, _v in defaultBlock do
	_object_57[_k] = _v
end
_object_57.blockId = 23
_object_57.health = 20
_object_57.blockArchetype = BlockArchetype.STONE
_object_56[_left_51] = _object_57
_object_5[_left_50] = _object_56
_object_5[ItemType.IRON] = {
	displayName = "Iron",
	itemMechanics = defaultItemMechanics,
}
_object_5[ItemType.DIAMOND] = {
	displayName = "Diamond",
	itemMechanics = defaultItemMechanics,
}
_object_5[ItemType.EMERALD] = {
	displayName = "Emerald",
	itemMechanics = defaultItemMechanics,
}
_object_5[ItemType.LEATHER_ARMOR] = {
	displayName = "Leather Armor",
	itemMechanics = defaultItemMechanics,
	AccessoryNames = { "Armor/Leather/LeatherArmor", "Armor/Leather/LeatherHelmet" },
	Armor = {
		ArmorType = ArmorType.CHESTPLATE,
		ProtectionAmount = 2,
	},
}
_object_5[ItemType.IRON_ARMOR] = {
	displayName = "Iron Armor",
	itemMechanics = defaultItemMechanics,
	AccessoryNames = { "Armor/Iron/IronArmor", "Armor/Iron/IronHelmet" },
	Armor = {
		ArmorType = ArmorType.CHESTPLATE,
		ProtectionAmount = 4,
	},
}
_object_5[ItemType.DIAMOND_ARMOR] = {
	displayName = "Diamond Armor",
	itemMechanics = defaultItemMechanics,
	AccessoryNames = { "Armor/Diamond/DiamondArmor", "Armor/Diamond/DiamondHelmet" },
	Armor = {
		ArmorType = ArmorType.CHESTPLATE,
		ProtectionAmount = 6,
	},
}
_object_5[ItemType.EMERALD_ARMOR] = {
	displayName = "Emerald Armor",
	itemMechanics = defaultItemMechanics,
	AccessoryNames = { "Armor/Emerald/EmeraldArmor", "Armor/Emerald/EmeraldHelmet" },
	Armor = {
		ArmorType = ArmorType.CHESTPLATE,
		ProtectionAmount = 8,
	},
}
local _left_52 = ItemType.STONE_PICKAXE
local _object_58 = {
	displayName = "Stone Pickaxe",
	itemAssets = pickaxeItemAssets,
}
local _left_53 = "itemMechanics"
local _object_59 = {}
for _k, _v in defaultItemMechanics do
	_object_59[_k] = _v
end
_object_59.cooldownSeconds = 0.2
_object_58[_left_53] = _object_59
local _left_54 = "breakBlock"
local _object_60 = {}
for _k, _v in defaultBreakBlock do
	_object_60[_k] = _v
end
_object_60.damage = 3
_object_60.extraDamageBlockArchetype = BlockArchetype.STONE
_object_58[_left_54] = _object_60
_object_5[_left_52] = _object_58
local _left_55 = ItemType.WOOD_SWORD
local _object_61 = {
	displayName = "Wood Sword",
	itemAssets = swordItemAssets,
	itemMechanics = swordItemMechanics,
}
local _left_56 = "melee"
local _object_62 = {}
for _k, _v in defaultSwordMelee do
	_object_62[_k] = _v
end
_object_62.damage = 5
_object_61[_left_56] = _object_62
_object_5[_left_55] = _object_61
local _left_57 = ItemType.STONE_SWORD
local _object_63 = {
	displayName = "Stone Sword",
	itemAssets = swordItemAssets,
	itemMechanics = swordItemMechanics,
}
local _left_58 = "melee"
local _object_64 = {}
for _k, _v in defaultSwordMelee do
	_object_64[_k] = _v
end
_object_64.damage = 8
_object_63[_left_58] = _object_64
_object_5[_left_57] = _object_63
local _left_59 = ItemType.IRON_SWORD
local _object_65 = {
	displayName = "Iron Sword",
	itemAssets = swordItemAssets,
	itemMechanics = swordItemMechanics,
}
local _left_60 = "melee"
local _object_66 = {}
for _k, _v in defaultSwordMelee do
	_object_66[_k] = _v
end
_object_66.damage = 10
_object_65[_left_60] = _object_66
_object_5[_left_59] = _object_65
local _left_61 = ItemType.DIAMOND_SWORD
local _object_67 = {
	displayName = "Diamond Sword",
	itemAssets = swordItemAssets,
	itemMechanics = swordItemMechanics,
}
local _left_62 = "melee"
local _object_68 = {}
for _k, _v in defaultSwordMelee do
	_object_68[_k] = _v
end
_object_68.damage = 13
_object_67[_left_62] = _object_68
_object_5[_left_61] = _object_67
local _left_63 = ItemType.DOUBLE_HIT_SWORD
local _object_69 = {
	displayName = "Double Hit Sword",
	itemAssets = swordItemAssets,
}
local _left_64 = "itemMechanics"
local _object_70 = {}
for _k, _v in swordItemMechanics do
	_object_70[_k] = _v
end
_object_70.cooldownSeconds = 1
_object_69[_left_64] = _object_70
local _left_65 = "melee"
local _object_71 = {}
for _k, _v in defaultSwordMelee do
	_object_71[_k] = _v
end
_object_71.damage = 10
_object_69[_left_65] = _object_71
_object_5[_left_63] = _object_69
local _left_66 = ItemType.RAGEBLADE
local _object_72 = {
	displayName = "Rageblade",
	itemAssets = swordItemAssets,
	itemMechanics = swordItemMechanics,
}
local _left_67 = "melee"
local _object_73 = {}
for _k, _v in defaultSwordMelee do
	_object_73[_k] = _v
end
_object_73.damage = 15
_object_72[_left_67] = _object_73
_object_5[_left_66] = _object_72
local _left_68 = ItemType.WOOD_BOW
local _object_74 = {
	displayName = "Wood Bow",
}
local _left_69 = "itemMechanics"
local _object_75 = {}
for _k, _v in rangedItemMechanics do
	_object_75[_k] = _v
end
_object_75.minChargeSeconds = 0.05
_object_75.maxChargeSeconds = 0.75
_object_75.cooldownSeconds = 0.25
_object_74[_left_69] = _object_75
_object_74.itemAssets = {
	onUseSoundId = "BowArrowFire",
	onUseSoundVolume = 0.5,
}
_object_74.ProjectileLauncher = {
	ammoItemType = ItemType.WOOD_ARROW,
	minVelocityScaler = 5,
	maxVelocityScaler = 40,
	firstPersonLaunchOffset = Vector3.new(1, -0.5, 0),
	chargingWalkSpeedMultiplier = 0.25,
}
_object_5[_left_68] = _object_74
_object_5[ItemType.WOOD_ARROW] = {
	displayName = "Wood Arrow",
	itemMechanics = defaultItemMechanics,
	Ammo = {
		yAxisAimAdjust = 0.1,
		damage = 15,
		gravity = defaultGravity * 0.25,
		projectileHitLayerMask = LayerUtil:GetLayerMask({ 0, 6, 3 }),
		onHitGroundSoundId = "BowArrowHit",
		onHitGroundSoundVolume = 0.5,
	},
}
local _left_70 = ItemType.TELEPEARL
local _object_76 = {
	displayName = "Telepearl",
}
local _left_71 = "itemMechanics"
local _object_77 = {}
for _k, _v in rangedItemMechanics do
	_object_77[_k] = _v
end
_object_77.minChargeSeconds = 0.05
_object_77.maxChargeSeconds = 0.75
_object_77.cooldownSeconds = 0.25
_object_76[_left_71] = _object_77
local _left_72 = "itemAssets"
local _object_78 = {}
for _k, _v in throwableItemAssets do
	_object_78[_k] = _v
end
_object_78.onUseSoundId = "TelepearlThrow"
_object_76[_left_72] = _object_78
_object_76.ProjectileLauncher = {
	ammoItemType = ItemType.TELEPEARL,
	minVelocityScaler = 4,
	maxVelocityScaler = 40,
	firstPersonLaunchOffset = Vector3.new(1, -0.5, 0),
}
_object_76.Ammo = {
	yAxisAimAdjust = 0.1,
	damage = 15,
	gravity = defaultGravity * 0.2,
	projectileHitLayerMask = LayerUtil:GetLayerMask({ 0, 6, 3 }),
}
_object_5[_left_70] = _object_76
_object_5[ItemType.FIREBALL] = {
	displayName = "Fireball",
	itemMechanics = rangedItemMechanics,
	itemAssets = throwableItemAssets,
	ProjectileLauncher = {
		ammoItemType = ItemType.FIREBALL,
		minVelocityScaler = 15,
		maxVelocityScaler = 15,
		firstPersonLaunchOffset = Vector3.new(1.5, 0, 0),
	},
	Ammo = {
		yAxisAimAdjust = 0,
		damage = 30,
		lifetimeSec = 6,
		gravity = 0,
		projectileHitLayerMask = LayerUtil:GetLayerMask({ 0, 6, 3 }),
	},
}
local items = _object_5
local function GetItemMeta(itemType)
	local val = items[itemType]
	if val == nil then
		error("FATAL: ItemType had no ItemMeta: " .. itemType)
	end
	return val
end
local blockIdToItemType = {}
for _, itemType in Object.values(ItemType) do
	local itemMeta = GetItemMeta(itemType)
	local _result = itemMeta.block
	if _result ~= nil then
		_result = _result.blockId
	end
	if _result ~= nil then
		local _blockId = itemMeta.block.blockId
		blockIdToItemType[_blockId] = itemType
	end
end
local function GetItemTypeFromBlockId(blockId)
	local _blockId = blockId
	return blockIdToItemType[_blockId]
end
-- Assign ID to each ItemType
local itemIdToItemType = {}
local i = 0
for _, itemType in Object.values(ItemType) do
	local itemMeta = GetItemMeta(itemType)
	itemMeta.ItemType = itemType
	itemMeta.ID = i
	local _i = i
	itemIdToItemType[_i] = itemType
	i += 1
end
local function GetItemTypeFromItemId(itemId)
	local _itemId = itemId
	return itemIdToItemType[_itemId]
end
local function IsItemType(s)
	local _exp = Object.values(ItemType)
	local _s = s
	return table.find(_exp, _s) ~= nil
end
return {
	GetItemMeta = GetItemMeta,
	GetItemTypeFromBlockId = GetItemTypeFromBlockId,
	GetItemTypeFromItemId = GetItemTypeFromItemId,
	IsItemType = IsItemType,
	items = items,
}
-- ----------------------------------
-- ----------------------------------
