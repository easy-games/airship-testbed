-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local OnUpdate = require("Shared/TS/Util/Timer").OnUpdate
local startTime = os.time()
--[[
	*
	* Time synced between server and client.
]]
local function SharedTime()
	return InstanceFinder.TimeManager:TicksToTime(0)
end
local function WaitFrame()
	local promise = TS.Promise.new(function(resolve)
		OnUpdate:Once(function()
			resolve()
		end)
	end)
	promise:await()
end
local TimeUtil
do
	TimeUtil = setmetatable({}, {
		__tostring = function()
			return "TimeUtil"
		end,
	})
	TimeUtil.__index = TimeUtil
	function TimeUtil.new(...)
		local self = setmetatable({}, TimeUtil)
		return self:constructor(...) or self
	end
	function TimeUtil:constructor()
	end
	function TimeUtil:GetLifetimeSeconds()
		return os.time() - startTime
	end
	function TimeUtil:GetServerTime()
		return SharedTime()
	end
	function TimeUtil:GetDeltaTime()
		return Time.deltaTime
	end
	function TimeUtil:GetFixedDeltaTime()
		return Time.fixedDeltaTime
	end
end
return {
	SharedTime = SharedTime,
	WaitFrame = WaitFrame,
	TimeUtil = TimeUtil,
}
-- ----------------------------------
-- ----------------------------------
