-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local EntityPrefabType = require("Shared/TS/Entity/EntityPrefabType").EntityPrefabType
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local Task = require("Shared/TS/Util/Task").Task
local SetTimeout = require("Shared/TS/Util/Timer").SetTimeout
local World = require("Shared/TS/VoxelWorld/World").World
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local LobbyWorldService
do
	LobbyWorldService = setmetatable({}, {
		__tostring = function()
			return "LobbyWorldService"
		end,
	})
	LobbyWorldService.__index = LobbyWorldService
	function LobbyWorldService.new(...)
		local self = setmetatable({}, LobbyWorldService)
		return self:constructor(...) or self
	end
	function LobbyWorldService:constructor(entityService)
		self.entityService = entityService
		ServerSignals.PlayerJoin:connect(function(event)
			Task:Spawn(function()
				self:SpawnPlayer(event.player)
			end)
		end)
		ServerSignals.EntityDeath:Connect(function(event)
			local player = event.entity.player
			if not player then
				return nil
			end
			SetTimeout(1, function()
				if player:IsConnected() then
					self:SpawnPlayer(player)
				end
			end)
		end)
		local world = WorldAPI:GetMainWorld()
		-- const worldBinaryFile = AssetBridge.LoadAsset<VoxelBinaryFile>("Server/Resources/Worlds/to4_sanctum.asset");
		local blockDefines = AssetBridge:LoadAsset("Shared/Resources/VoxelWorld/BlockDefines.xml")
		-- world.LoadWorldFromVoxelBinaryFile(worldBinaryFile, blockDefines);
		world:LoadEmptyWorld(blockDefines, World.SKYBOX)
		local width = 12
		do
			local x = 200
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					x += 1
				else
					_shouldIncrement = true
				end
				if not (x <= 200 + width) then
					break
				end
				do
					local z = 200
					local _shouldIncrement_1 = false
					while true do
						if _shouldIncrement_1 then
							z += 1
						else
							_shouldIncrement_1 = true
						end
						if not (z <= 200 + width) then
							break
						end
						local pos = Vector3.new(x, 10, z)
						world:PlaceBlock(pos, ItemType.GRASS)
					end
				end
			end
		end
	end
	function LobbyWorldService:GetSpawnPosition()
		return Vector3.new(206, 11, 206)
		-- return new Vector3(math.round(107.5 + math.random() * 2 - 1.5), 26, 21.5 + math.random() * 2 - 1.5);
	end
	function LobbyWorldService:SpawnPlayer(player)
		self.entityService:SpawnEntityForPlayer(player, EntityPrefabType.HUMAN, self:GetSpawnPosition())
	end
	function LobbyWorldService:OnStart()
		print("LobbyWorldService.OnStart")
	end
end
-- (Flamework) LobbyWorldService metadata
Reflect.defineMetadata(LobbyWorldService, "identifier", "Bundles/Server/Services/Lobby/World/LobbyWorldService@LobbyWorldService")
Reflect.defineMetadata(LobbyWorldService, "flamework:parameters", { "Bundles/Server/Services/Global/Entity/EntityService@EntityService" })
Reflect.defineMetadata(LobbyWorldService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(LobbyWorldService, "$:flamework@Service", Service, { {} })
return {
	LobbyWorldService = LobbyWorldService,
}
-- ----------------------------------
-- ----------------------------------
