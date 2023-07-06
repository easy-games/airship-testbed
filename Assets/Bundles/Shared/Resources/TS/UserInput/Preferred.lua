-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
local PreferredDriver = require("Shared/TS/UserInput/Drivers/PreferredDriver").PreferredDriver
-- * Utility class for observing the player's currently-used control scheme.
local Preferred
do
	Preferred = setmetatable({}, {
		__tostring = function()
			return "Preferred"
		end,
	})
	Preferred.__index = Preferred
	function Preferred.new(...)
		local self = setmetatable({}, Preferred)
		return self:constructor(...) or self
	end
	function Preferred:constructor()
		self.bin = Bin.new()
		self.preferredDriver = PreferredDriver:instance()
		self.ControlSchemeChanged = Signal.new()
		self.bin:Add(self.ControlSchemeChanged)
		self.controlScheme = self.preferredDriver:GetScheme()
		self.bin:Connect(self.preferredDriver.SchemeChanged, function(scheme)
			self.controlScheme = scheme
			self.ControlSchemeChanged:Fire(self.controlScheme)
		end)
	end
	function Preferred:GetControlScheme()
		return self.controlScheme
	end
	function Preferred:ObserveControlScheme(observer)
		local cleanup
		cleanup = observer(self.controlScheme)
		local disconnectChanged = self.ControlSchemeChanged:Connect(function(controlScheme)
			local _result = cleanup
			if _result ~= nil then
				_result()
			end
			cleanup = observer(controlScheme)
		end)
		local observing = true
		local stopObserving = function()
			if not observing then
				return nil
			end
			observing = false
			disconnectChanged()
			if cleanup ~= nil then
				cleanup()
				cleanup = nil
			end
		end
		self.bin:Add(stopObserving)
		return stopObserving
	end
	function Preferred:Destroy()
		self.bin:Destroy()
	end
end
return {
	Preferred = Preferred,
}
-- ----------------------------------
-- ----------------------------------
