-- Compiled with unity-ts v2.1.0-75
local ItemAnimationData
do
	ItemAnimationData = setmetatable({}, {
		__tostring = function()
			return "ItemAnimationData"
		end,
	})
	ItemAnimationData.__index = ItemAnimationData
	function ItemAnimationData.new(...)
		local self = setmetatable({}, ItemAnimationData)
		return self:constructor(...) or self
	end
	function ItemAnimationData:constructor()
		self.equip = ""
		self.unEquip = ""
		self.uses = {}
	end
end
return {
	ItemAnimationData = ItemAnimationData,
}
-- ----------------------------------
-- ----------------------------------
