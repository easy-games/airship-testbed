-- Compiled with unity-ts v2.1.0-75
local scene = SceneManager:GetActiveScene().name
local BedWars
do
	BedWars = setmetatable({}, {
		__tostring = function()
			return "BedWars"
		end,
	})
	BedWars.__index = BedWars
	function BedWars.new(...)
		local self = setmetatable({}, BedWars)
		return self:constructor(...) or self
	end
	function BedWars:constructor()
	end
	function BedWars:IsLobbyServer()
		return scene == "BWLobbyScene"
	end
	function BedWars:IsMatchServer()
		return scene == "BWMatchScene"
	end
end
return {
	BedWars = BedWars,
}
-- ----------------------------------
-- ----------------------------------
