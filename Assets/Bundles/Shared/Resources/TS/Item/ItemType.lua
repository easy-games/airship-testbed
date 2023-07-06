-- Compiled with unity-ts v2.1.0-75
local ItemType
do
	local _inverse = {}
	ItemType = setmetatable({}, {
		__index = _inverse,
	})
	ItemType.DEFAULT = "DEFAULT"
	_inverse.DEFAULT = "DEFAULT"
	ItemType.GRASS = "GRASS"
	_inverse.GRASS = "GRASS"
	ItemType.DIRT = "DIRT"
	_inverse.DIRT = "DIRT"
	ItemType.STONE = "STONE"
	_inverse.STONE = "STONE"
	ItemType.BED = "BED"
	_inverse.BED = "BED"
	ItemType.COBBLESTONE = "COBBLESTONE"
	_inverse.COBBLESTONE = "COBBLESTONE"
	ItemType.OAK_WOOD_PLANK = "OAK_WOOD_PLANK"
	_inverse.OAK_WOOD_PLANK = "OAK_WOOD_PLANK"
	ItemType.OAK_LOG = "OAK_LOG"
	_inverse.OAK_LOG = "OAK_LOG"
	ItemType.CLAY = "CLAY"
	_inverse.CLAY = "CLAY"
	ItemType.WHITE_CLAY = "WHITE_CLAY"
	_inverse.WHITE_CLAY = "WHITE_CLAY"
	ItemType.BLACK_CLAY = "BLACK_CLAY"
	_inverse.BLACK_CLAY = "BLACK_CLAY"
	ItemType.YELLOW_CLAY = "YELLOW_CLAY"
	_inverse.YELLOW_CLAY = "YELLOW_CLAY"
	ItemType.GRAY_CLAY = "GRAY_CLAY"
	_inverse.GRAY_CLAY = "GRAY_CLAY"
	ItemType.LIGHT_GREEN_CLAY = "LIGHT_GREEN_CLAY"
	_inverse.LIGHT_GREEN_CLAY = "LIGHT_GREEN_CLAY"
	ItemType.DARK_GREEN_CLAY = "DARK_GREEN_CLAY"
	_inverse.DARK_GREEN_CLAY = "DARK_GREEN_CLAY"
	ItemType.DIAMOND_BLOCK = "DIAMOND_BLOCK"
	_inverse.DIAMOND_BLOCK = "DIAMOND_BLOCK"
	ItemType.EMERALD_BLOCK = "EMERALD_BLOCK"
	_inverse.EMERALD_BLOCK = "EMERALD_BLOCK"
	ItemType.IRON_BLOCK = "IRON_BLOCK"
	_inverse.IRON_BLOCK = "IRON_BLOCK"
	ItemType.MUSHROOM = "MUSHROOM"
	_inverse.MUSHROOM = "MUSHROOM"
	ItemType.RAGEBLADE = "RAGEBLADE"
	_inverse.RAGEBLADE = "RAGEBLADE"
	ItemType.IRON = "IRON"
	_inverse.IRON = "IRON"
	ItemType.DIAMOND = "DIAMOND"
	_inverse.DIAMOND = "DIAMOND"
	ItemType.EMERALD = "EMERALD"
	_inverse.EMERALD = "EMERALD"
	ItemType.STONE_BRICK = "STONE_BRICK"
	_inverse.STONE_BRICK = "STONE_BRICK"
	ItemType.SLATE_BRICK = "SLATE_BRICK"
	_inverse.SLATE_BRICK = "SLATE_BRICK"
	ItemType.WHITE_WOOL = "WHITE_WOOL"
	_inverse.WHITE_WOOL = "WHITE_WOOL"
	ItemType.BLUE_WOOL = "BLUE_WOOL"
	_inverse.BLUE_WOOL = "BLUE_WOOL"
	ItemType.TALL_GRASS = "TALL_GRASS"
	_inverse.TALL_GRASS = "TALL_GRASS"
	ItemType.GRIM_STONE = "GRIM_STONE"
	_inverse.GRIM_STONE = "GRIM_STONE"
	ItemType.OBSIDIAN = "OBSIDIAN"
	_inverse.OBSIDIAN = "OBSIDIAN"
	ItemType.ANDESITE = "ANDESITE"
	_inverse.ANDESITE = "ANDESITE"
	ItemType.WOOD_SWORD = "WOOD_SWORD"
	_inverse.WOOD_SWORD = "WOOD_SWORD"
	ItemType.STONE_SWORD = "STONE_SWORD"
	_inverse.STONE_SWORD = "STONE_SWORD"
	ItemType.IRON_SWORD = "IRON_SWORD"
	_inverse.IRON_SWORD = "IRON_SWORD"
	ItemType.DIAMOND_SWORD = "DIAMOND_SWORD"
	_inverse.DIAMOND_SWORD = "DIAMOND_SWORD"
	ItemType.DOUBLE_HIT_SWORD = "DOUBLE_HIT_SWORD"
	_inverse.DOUBLE_HIT_SWORD = "DOUBLE_HIT_SWORD"
	ItemType.STONE_PICKAXE = "STONE_PICKAXE"
	_inverse.STONE_PICKAXE = "STONE_PICKAXE"
	ItemType.TELEPEARL = "TELEPEARL"
	_inverse.TELEPEARL = "TELEPEARL"
	ItemType.WOOD_BOW = "WOOD_BOW"
	_inverse.WOOD_BOW = "WOOD_BOW"
	ItemType.WOOD_ARROW = "WOOD_ARROW"
	_inverse.WOOD_ARROW = "WOOD_ARROW"
	ItemType.FIREBALL = "FIREBALL"
	_inverse.FIREBALL = "FIREBALL"
	ItemType.LEATHER_ARMOR = "LEATHER_ARMOR"
	_inverse.LEATHER_ARMOR = "LEATHER_ARMOR"
	ItemType.IRON_ARMOR = "IRON_ARMOR"
	_inverse.IRON_ARMOR = "IRON_ARMOR"
	ItemType.DIAMOND_ARMOR = "DIAMOND_ARMOR"
	_inverse.DIAMOND_ARMOR = "DIAMOND_ARMOR"
	ItemType.EMERALD_ARMOR = "EMERALD_ARMOR"
	_inverse.EMERALD_ARMOR = "EMERALD_ARMOR"
end
local ItemArchetype
do
	local _inverse = {}
	ItemArchetype = setmetatable({}, {
		__index = _inverse,
	})
	ItemArchetype.DEFAULT = 0
	_inverse[0] = "DEFAULT"
	ItemArchetype.BLOCK = 1
	_inverse[1] = "BLOCK"
	ItemArchetype.BED = 2
	_inverse[2] = "BED"
	ItemArchetype.ARMOR = 3
	_inverse[3] = "ARMOR"
	ItemArchetype.MELEE = 4
	_inverse[4] = "MELEE"
	ItemArchetype.PROJECTILE = 5
	_inverse[5] = "PROJECTILE"
end
return {
	ItemType = ItemType,
	ItemArchetype = ItemArchetype,
}
-- ----------------------------------
-- ----------------------------------
