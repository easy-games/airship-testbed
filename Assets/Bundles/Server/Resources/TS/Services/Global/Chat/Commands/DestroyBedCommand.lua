-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local Network = require("Shared/TS/Network").Network
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local DestroyBedCommand
do
	local super = ChatCommand
	DestroyBedCommand = setmetatable({}, {
		__tostring = function()
			return "DestroyBedCommand"
		end,
		__index = super,
	})
	DestroyBedCommand.__index = DestroyBedCommand
	function DestroyBedCommand.new(...)
		local self = setmetatable({}, DestroyBedCommand)
		return self:constructor(...) or self
	end
	function DestroyBedCommand:constructor()
		super.constructor(self, "destroyBed")
	end
	function DestroyBedCommand:Execute(player, args)
		if #args < 1 then
			player:SendMessage("Invalid arguments.")
		end
		local teamName = args[1]
		-- Validate team.
		local targetTeam = (Flamework.resolveDependency("Bundles/Server/Services/Global/Team/TeamService@TeamService")):GetTeamByName(teamName)
		if not targetTeam then
			player:SendMessage("Invalid team name: " .. teamName)
			return nil
		end
		-- Destroy bed.
		local bedState = (Flamework.resolveDependency("Bundles/Server/Services/Match/BedService@BedService")):GetBedStateForTeamId(targetTeam.id)
		if not bedState or bedState.destroyed then
			player:SendMessage("Bed does not exist or is already destroyed.")
		else
			local bedMeta = GetItemMeta(ItemType.BED)
			local world = WorldAPI:GetMainWorld()
			world:PlaceBlockById(bedState.position, 0)
			local _fn = ServerSignals.BlockDestroyed
			local _object = {}
			local _left = "blockId"
			local _result = bedMeta.block
			if _result ~= nil then
				_result = _result.blockId
			end
			local _condition = _result
			if _condition == nil then
				_condition = -1
			end
			_object[_left] = _condition
			_object.blockMeta = bedMeta
			_object.blockPos = bedState.position
			_fn:Fire(_object)
			Network.ServerToClient.BlockDestroyed.Server:FireAllClients(bedState.position, bedMeta.block.blockId)
			ServerSignals.BedDestroyed:Fire({
				bedTeamId = targetTeam.id,
			})
		end
	end
end
return {
	DestroyBedCommand = DestroyBedCommand,
}
-- ----------------------------------
-- ----------------------------------
