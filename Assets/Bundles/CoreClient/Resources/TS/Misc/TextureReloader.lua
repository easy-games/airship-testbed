-- Compiled with unity-ts v2.1.0-75
local Game = require("Shared/TS/Game").Game
local Keyboard = require("Shared/TS/UserInput/init").Keyboard
local keyboard = Keyboard.new()
keyboard.KeyDown:Connect(function(event)
	if event.Key == 102 then
		local _result = GameObject:Find("VoxelWorld")
		if _result ~= nil then
			_result = _result:GetComponent("VoxelWorld")
		end
		local voxelWorld = _result
		if not voxelWorld then
			Game.LocalPlayer:SendMessage("VoxelWorld not found.")
			return nil
		end
		voxelWorld:ReloadTextureAtlas()
		Game.LocalPlayer:SendMessage("Reloaded textures!")
	end
end)
return nil
-- ----------------------------------
-- ----------------------------------
