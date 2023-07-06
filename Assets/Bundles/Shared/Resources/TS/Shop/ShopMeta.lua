-- Compiled with unity-ts v2.1.0-75
local ItemType = require("Shared/TS/Item/ItemType").ItemType
-- * Describes a shop category.
local ShopCategory
do
	local _inverse = {}
	ShopCategory = setmetatable({}, {
		__index = _inverse,
	})
	ShopCategory.BLOCKS = "Blocks"
	_inverse.Blocks = "BLOCKS"
	ShopCategory.COMBAT = "Combat"
	_inverse.Combat = "COMBAT"
	ShopCategory.TOOLS = "Tools"
	_inverse.Tools = "TOOLS"
end
-- * Describes a shop item.
-- * Describes a shop.
-- * Default shop.
local DEFAULT_BEDWARS_SHOP = {
	shopItems = { {
		item = ItemType.GRASS,
		currency = ItemType.IRON,
		price = 8,
		quantity = 16,
		category = ShopCategory.BLOCKS,
	}, {
		item = ItemType.COBBLESTONE,
		currency = ItemType.IRON,
		price = 40,
		quantity = 16,
		category = ShopCategory.BLOCKS,
	}, {
		item = ItemType.STONE_SWORD,
		currency = ItemType.IRON,
		price = 20,
		quantity = 1,
		category = ShopCategory.COMBAT,
	}, {
		item = ItemType.IRON_SWORD,
		currency = ItemType.IRON,
		price = 70,
		quantity = 1,
		category = ShopCategory.COMBAT,
	}, {
		item = ItemType.DIAMOND_SWORD,
		currency = ItemType.EMERALD,
		price = 3,
		quantity = 1,
		category = ShopCategory.COMBAT,
	}, {
		item = ItemType.WOOD_BOW,
		currency = ItemType.IRON,
		price = 24,
		quantity = 1,
		category = ShopCategory.COMBAT,
	}, {
		item = ItemType.WOOD_ARROW,
		currency = ItemType.IRON,
		price = 16,
		quantity = 8,
		category = ShopCategory.COMBAT,
	}, {
		item = ItemType.TELEPEARL,
		currency = ItemType.EMERALD,
		price = 2,
		quantity = 1,
		category = ShopCategory.COMBAT,
	}, {
		item = ItemType.STONE_PICKAXE,
		currency = ItemType.IRON,
		price = 20,
		quantity = 1,
		category = ShopCategory.TOOLS,
	} },
}
return {
	ShopCategory = ShopCategory,
	DEFAULT_BEDWARS_SHOP = DEFAULT_BEDWARS_SHOP,
}
-- ----------------------------------
-- ----------------------------------
