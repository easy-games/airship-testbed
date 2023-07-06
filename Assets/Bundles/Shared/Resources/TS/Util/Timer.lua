-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local OnUpdate = Signal.new():WithYieldTracking(false)
local OnLateUpdate = Signal.new():WithYieldTracking(false)
local OnFixedUpdate = Signal.new():WithYieldTracking(false)
local OnTick = Signal.new():WithYieldTracking(false)
local function SetTimeout(duration, callback, ...)
	local args = { ... }
	local triggerTime = Time.time + duration
	local disconnect
	disconnect = OnUpdate:Connect(function()
		if Time.time >= triggerTime then
			disconnect()
			callback(unpack(args))
		end
	end)
	return disconnect
end
local function SetInterval(interval, callback, immediate)
	if immediate then
		callback()
	end
	local nextTriggerTime = Time.time + interval
	local disconnect = OnUpdate:Connect(function()
		local now = Time.time
		if now >= nextTriggerTime then
			nextTriggerTime = now + interval
			callback()
		end
	end)
	return disconnect
end
return {
	SetTimeout = SetTimeout,
	SetInterval = SetInterval,
	OnUpdate = OnUpdate,
	OnLateUpdate = OnLateUpdate,
	OnFixedUpdate = OnFixedUpdate,
	OnTick = OnTick,
}
-- ----------------------------------
-- ----------------------------------
