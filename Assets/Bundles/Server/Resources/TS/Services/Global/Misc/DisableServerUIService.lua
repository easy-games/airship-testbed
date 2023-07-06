-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local DisableServerUIService
do
	DisableServerUIService = setmetatable({}, {
		__tostring = function()
			return "DisableServerUIService"
		end,
	})
	DisableServerUIService.__index = DisableServerUIService
	function DisableServerUIService.new(...)
		local self = setmetatable({}, DisableServerUIService)
		return self:constructor(...) or self
	end
	function DisableServerUIService:constructor()
	end
	function DisableServerUIService:OnStart()
		-- Disables all UI
		self:DisableChildren(GameObject:Find("UI").transform)
		self:DisableChildren(GameObject:Find("CoreUI").transform)
	end
	function DisableServerUIService:DisableChildren(transform)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < transform.childCount) then
					break
				end
				local child = transform:GetChild(i)
				local canvas = child.gameObject:GetComponentIfExists("Canvas")
				if canvas then
					canvas.enabled = false
				end
			end
		end
	end
end
-- (Flamework) DisableServerUIService metadata
Reflect.defineMetadata(DisableServerUIService, "identifier", "Bundles/Server/Services/Global/Misc/DisableServerUIService@DisableServerUIService")
Reflect.defineMetadata(DisableServerUIService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(DisableServerUIService, "$:flamework@Service", Service, { {} })
return {
	DisableServerUIService = DisableServerUIService,
}
-- ----------------------------------
-- ----------------------------------
