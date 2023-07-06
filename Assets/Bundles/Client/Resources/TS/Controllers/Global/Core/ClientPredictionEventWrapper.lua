-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Network = require("Shared/TS/Network").Network
local Block = require("Shared/TS/VoxelWorld/Block").Block
local Entity = require("Shared/TS/Entity/Entity").Entity
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local ClientPredictionEventWrapper
do
	ClientPredictionEventWrapper = setmetatable({}, {
		__tostring = function()
			return "ClientPredictionEventWrapper"
		end,
	})
	ClientPredictionEventWrapper.__index = ClientPredictionEventWrapper
	function ClientPredictionEventWrapper.new(...)
		local self = setmetatable({}, ClientPredictionEventWrapper)
		return self:constructor(...) or self
	end
	function ClientPredictionEventWrapper:constructor()
	end
	function ClientPredictionEventWrapper:OnStart()
		Network.ServerToClient.BlockPlace.Client:OnServerEvent(function(pos, voxelData, entityId)
			local voxel = Block.new(voxelData, WorldAPI:GetMainWorld())
			local placer
			if entityId ~= nil then
				placer = Entity:FindById(entityId)
			end
			local _result = placer
			if _result ~= nil then
				_result = _result:IsLocalCharacter()
			end
			if _result then
				-- we already client predicted this event.
				return nil
			end
			local BlockPlaceClientSignal = TS.Promise.new(function(resolve)
				resolve(require("Client/TS/Signals/BlockPlaceClientSignal"))
			end):expect().BlockPlaceClientSignal
			ClientSignals.BlockPlace:Fire(BlockPlaceClientSignal.new(pos, voxel, placer))
		end)
	end
end
-- (Flamework) ClientPredictionEventWrapper metadata
Reflect.defineMetadata(ClientPredictionEventWrapper, "identifier", "Bundles/Client/Controllers/Global/Core/ClientPredictionEventWrapper@ClientPredictionEventWrapper")
Reflect.defineMetadata(ClientPredictionEventWrapper, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ClientPredictionEventWrapper, "$:flamework@Controller", Controller, { {} })
return {
	ClientPredictionEventWrapper = ClientPredictionEventWrapper,
}
-- ----------------------------------
-- ----------------------------------
