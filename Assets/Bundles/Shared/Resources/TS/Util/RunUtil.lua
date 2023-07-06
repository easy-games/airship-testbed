-- Compiled with unity-ts v2.1.0-75
local isClient = RunCore:IsClient()
local isServer = RunCore:IsServer()
local isEditor = RunCore:IsEditor()
local platform = Application.platform
local RunUtil
do
	RunUtil = setmetatable({}, {
		__tostring = function()
			return "RunUtil"
		end,
	})
	RunUtil.__index = RunUtil
	function RunUtil.new(...)
		local self = setmetatable({}, RunUtil)
		return self:constructor(...) or self
	end
	function RunUtil:constructor()
	end
	function RunUtil:IsClient()
		return isClient
	end
	function RunUtil:IsServer()
		return isServer
	end
	function RunUtil:IsEditor()
		return isEditor
	end
	function RunUtil:IsWindows()
		return platform == 2 or platform == 7
	end
	function RunUtil:IsMac()
		return platform == 1 or platform == 0
	end
end
return {
	RunUtil = RunUtil,
}
-- ----------------------------------
-- ----------------------------------
