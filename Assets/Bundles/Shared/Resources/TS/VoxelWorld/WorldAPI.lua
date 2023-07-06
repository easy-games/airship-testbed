-- Compiled with unity-ts v2.1.0-75
local World = require("Shared/TS/VoxelWorld/World").World
local WorldAPI
do
	WorldAPI = setmetatable({}, {
		__tostring = function()
			return "WorldAPI"
		end,
	})
	WorldAPI.__index = WorldAPI
	function WorldAPI.new(...)
		local self = setmetatable({}, WorldAPI)
		return self:constructor(...) or self
	end
	function WorldAPI:constructor()
	end
	function WorldAPI:GetMainWorld()
		if self.world then
			return self.world
		end
		local voxelWorld = GameObject:Find("VoxelWorld"):GetComponent("VoxelWorld")
		self.world = World.new(voxelWorld)
		return self.world
	end
	WorldAPI.DefaultVoxelHealth = 10
	WorldAPI.ChildVoxelId = 32
end
return {
	WorldAPI = WorldAPI,
}
-- ----------------------------------
-- ----------------------------------
