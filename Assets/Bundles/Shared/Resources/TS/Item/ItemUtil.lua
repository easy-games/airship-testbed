-- Compiled with unity-ts v2.1.0-75
local ItemType = require("Shared/TS/Item/ItemType").ItemType
--[[
	*
	* Set of utilities for working with items.
]]
local ItemUtil
do
	ItemUtil = setmetatable({}, {
		__tostring = function()
			return "ItemUtil"
		end,
	})
	ItemUtil.__index = ItemUtil
	function ItemUtil.new(...)
		local self = setmetatable({}, ItemUtil)
		return self:constructor(...) or self
	end
	function ItemUtil:constructor()
	end
	function ItemUtil:GetItemRenderTexture(itemType)
		local imageSrc = string.lower(itemType) .. ".png"
		local path = "Client/Resources/Assets/ItemRenders/" .. imageSrc
		return AssetBridge:LoadAsset(path)
	end
	function ItemUtil:GetItemRenderPath(itemType)
		local imageSrc = string.lower(itemType) .. ".png"
		return "Client/Resources/Assets/ItemRenders/" .. imageSrc
	end
	function ItemUtil:IsResource(itemType)
		return itemType == ItemType.IRON or (itemType == ItemType.DIAMOND or itemType == ItemType.EMERALD)
	end
end
return {
	ItemUtil = ItemUtil,
}
-- ----------------------------------
-- ----------------------------------
