-- Compiled with unity-ts v2.1.0-75
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local GroundItemUtil
do
	GroundItemUtil = setmetatable({}, {
		__tostring = function()
			return "GroundItemUtil"
		end,
	})
	GroundItemUtil.__index = GroundItemUtil
	function GroundItemUtil.new(...)
		local self = setmetatable({}, GroundItemUtil)
		return self:constructor(...) or self
	end
	function GroundItemUtil:constructor()
	end
	function GroundItemUtil:CanPickupGroundItem(itemStack, groundItemNob, characterPosition)
		local _characterPosition = characterPosition
		local _position = groundItemNob.gameObject.transform.position
		local dist = (_characterPosition - _position).magnitude
		if dist > 1.5 then
			return false
		end
		local attributes = groundItemNob.gameObject:GetComponent("EasyAttributes")
		local _condition = attributes:GetNumber("pickupTime")
		if _condition == nil then
			_condition = 0
		end
		local pickupTime = _condition
		if TimeUtil:GetServerTime() < pickupTime then
			return false
		end
		return true
	end
end
return {
	GroundItemUtil = GroundItemUtil,
}
-- ----------------------------------
-- ----------------------------------
