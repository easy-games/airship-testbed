-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local ItemUtil = require("Shared/TS/Item/ItemUtil").ItemUtil
local Network = require("Shared/TS/Network").Network
local SetUtil = require("Shared/TS/Util/SetUtil").SetUtil
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local BWService
do
	BWService = setmetatable({}, {
		__tostring = function()
			return "BWService"
		end,
	})
	BWService.__index = BWService
	function BWService.new(...)
		local self = setmetatable({}, BWService)
		return self:constructor(...) or self
	end
	function BWService:constructor(bedService, teamService, matchService, playerService)
		self.bedService = bedService
		self.teamService = teamService
		self.matchService = matchService
		self.playerService = playerService
		self.eliminatedTeams = {}
		self.eliminatedPlayers = {}
		self.winnerDeclared = false
		self.bedHasBeenDestroyed = false
	end
	function BWService:OnStart()
		-- Listen for bed destroy for BW win condition.
		ServerSignals.BedDestroyed:Connect(function()
			self.bedHasBeenDestroyed = true
			self:CheckForWin()
		end)
		-- Listen for entity death for BW win condition, give loot.
		ServerSignals.EntityDeath:ConnectWithPriority(0, function(event)
			if not self.matchService:IsRunning() then
				return nil
			end
			-- Eliminate player, if applicable.
			if TS.instanceof(event.entity, CharacterEntity) then
				if event.entity.player and (event.entity.player:GetTeam() and self.bedService:IsBedDestroyed(event.entity.player:GetTeam().id)) then
					local _eliminatedPlayers = self.eliminatedPlayers
					local _player = event.entity.player
					_eliminatedPlayers[_player] = true
					ServerSignals.PlayerEliminated:Fire({
						player = event.entity.player,
					})
					Network.ServerToClient.PlayerEliminated.Server:FireAllClients(event.entity.player.clientId)
				end
				self:CheckForWin()
			end
			-- Give resources to killer.
			local _result = event.entity
			if _result ~= nil then
				_result = _result.player
			end
			local _condition = _result
			if _condition then
				_condition = TS.instanceof(event.entity, CharacterEntity)
				if _condition then
					local _result_1 = event.killer
					if _result_1 ~= nil then
						_result_1 = _result_1.player
					end
					_condition = _result_1
					if _condition then
						_condition = TS.instanceof(event.killer, CharacterEntity)
					end
				end
			end
			if _condition then
				local deathEntityInv = event.entity:GetInventory()
				local killerEntityInv = event.killer:GetInventory()
				do
					local i = 0
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < deathEntityInv:GetMaxSlots()) then
							break
						end
						local invSlot = deathEntityInv:GetItem(i)
						if not invSlot then
							continue
						end
						local itemType = invSlot:GetItemType()
						local itemQuantity = invSlot:GetAmount()
						if ItemUtil:IsResource(itemType) then
							killerEntityInv:AddItem(ItemStack.new(itemType, itemQuantity))
						end
					end
				end
			end
		end)
		-- Teammates _cannot_ damage each other.
		ServerSignals.EntityDamage:Connect(function(event)
			local _result = event.fromEntity
			if _result ~= nil then
				_result = _result.player
			end
			local _condition = _result
			if _condition then
				_condition = TS.instanceof(event.fromEntity, CharacterEntity) and (event.entity.player and TS.instanceof(event.entity, CharacterEntity))
			end
			if _condition then
				local fromEntityTeam = event.fromEntity.player:GetTeam()
				local entityTeam = event.entity.player:GetTeam()
				local _result_1 = fromEntityTeam
				if _result_1 ~= nil then
					_result_1 = _result_1.id
				end
				local _result_2 = entityTeam
				if _result_2 ~= nil then
					_result_2 = _result_2.id
				end
				if _result_1 == _result_2 then
					event:SetCancelled(true)
				end
			end
		end)
		-- Teams _cannot_ damage their own beds.
		ServerSignals.BeforeBlockHit:Connect(function(event)
			local teamId = VoxelDataAPI:GetVoxelData(event.BlockPos, "teamId")
			local _condition = teamId ~= nil
			if _condition then
				local _result = event.Player:GetTeam()
				if _result ~= nil then
					_result = _result.id
				end
				_condition = teamId == _result
			end
			if _condition then
				event:SetCancelled(true)
			end
		end)
	end
	function BWService:IsPlayerEliminated(player)
		local _eliminatedPlayers = self.eliminatedPlayers
		local _player = player
		return _eliminatedPlayers[_player] ~= nil
	end
	function BWService:GetEliminatedPlayers()
		return SetUtil:ToArray(self.eliminatedPlayers)
	end
	function BWService:GetEliminatedPlayersOnTeam(team)
		local _exp = SetUtil:ToArray(self.eliminatedPlayers)
		local _arg0 = function(player)
			local _result = player:GetTeam()
			if _result ~= nil then
				_result = _result.id
			end
			return _result == team.id
		end
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _length = 0
		for _k, _v in _exp do
			if _arg0(_v, _k - 1, _exp) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		return _newValue
	end
	function BWService:GetAlivePlayersOnTeam(team)
		local _exp = self.playerService:GetPlayers()
		local _arg0 = function(player)
			local _result = player:GetTeam()
			if _result ~= nil then
				_result = _result.id
			end
			local _condition = _result == team.id
			if _condition then
				local _eliminatedPlayers = self.eliminatedPlayers
				local _player = player
				_condition = not (_eliminatedPlayers[_player] ~= nil)
			end
			return _condition
		end
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _length = 0
		for _k, _v in _exp do
			if _arg0(_v, _k - 1, _exp) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		return _newValue
	end
	function BWService:IsTeamEliminated(team)
		local _eliminatedTeams = self.eliminatedTeams
		local _team = team
		return _eliminatedTeams[_team] ~= nil
	end
	function BWService:CheckForWin()
		local nonEliminatedTeams = {}
		local teams = self.teamService:GetTeams()
		--[[
			* A team is considered eliminated if **all** players
			* are dead AND their bed is destroyed.
		]]
		local _arg0 = function(team)
			local players = SetUtil:ToArray(team:GetPlayers())
			local noPlayersOnTeam = #players == 0
			local _arg0_1 = function(player)
				local _eliminatedPlayers = self.eliminatedPlayers
				local _player = player
				if _eliminatedPlayers[_player] ~= nil then
					return true
				end
				return false
			end
			-- ▼ ReadonlyArray.every ▼
			local _result = true
			for _k, _v in players do
				if not _arg0_1(_v, _k - 1, players) then
					_result = false
					break
				end
			end
			-- ▲ ReadonlyArray.every ▲
			local allPlayersEliminated = _result
			local bedDestroyed = self.bedService:IsBedDestroyed(team.id)
			local isEliminated = noPlayersOnTeam or (allPlayersEliminated and bedDestroyed)
			if not isEliminated then
				local _team = team
				table.insert(nonEliminatedTeams, _team)
			else
				local _eliminatedTeams = self.eliminatedTeams
				local _team = team
				_eliminatedTeams[_team] = true
			end
		end
		for _k, _v in teams do
			_arg0(_v, _k - 1, teams)
		end
		-- If only _one_ team is not eliminated, they win.
		if #nonEliminatedTeams == 1 and self.bedHasBeenDestroyed then
			self:DeclareWinner(nonEliminatedTeams[1])
			return true
		end
		return false
	end
	function BWService:DeclareWinner(team)
		self.winnerDeclared = true
		self.matchService:EndMatch(team)
	end
end
-- (Flamework) BWService metadata
Reflect.defineMetadata(BWService, "identifier", "Bundles/Server/Services/Match/BW/BWService@BWService")
Reflect.defineMetadata(BWService, "flamework:parameters", { "Bundles/Server/Services/Match/BedService@BedService", "Bundles/Server/Services/Global/Team/TeamService@TeamService", "Bundles/Server/Services/Match/MatchService@MatchService", "Bundles/Server/Services/Global/Player/PlayerService@PlayerService" })
Reflect.defineMetadata(BWService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BWService, "$:flamework@Service", Service, { {} })
return {
	BWService = BWService,
}
-- ----------------------------------
-- ----------------------------------
