-- Compiled with unity-ts v2.1.0-75
local _Timer = require("Shared/TS/Util/Timer")
local SetInterval = _Timer.SetInterval
local SetTimeout = _Timer.SetTimeout
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
-- * Wrapper around the `coroutine` module to emulate Roblox's task module.
local Task
do
	Task = setmetatable({}, {
		__tostring = function()
			return "Task"
		end,
	})
	Task.__index = Task
	function Task.new(...)
		local self = setmetatable({}, Task)
		return self:constructor(...) or self
	end
	function Task:constructor()
	end
	function Task:Spawn(callback)
		return coroutine.wrap(callback)()
	end
	function Task:Delay(duration, callback)
		SetTimeout(duration, callback)
	end
	function Task:Repeat(interval, callback)
		return SetInterval(interval, callback)
	end
	function Task:Wait(duration)
		wait(duration)
	end
	function Task:WaitFrame()
		-- TEMP.
		Task:Wait(TimeUtil:GetDeltaTime())
	end
	function Task:Defer(callback)
		-- TEMP.
		Task:WaitFrame()
		callback()
	end
end
return {
	Task = Task,
}
-- ----------------------------------
-- ----------------------------------
