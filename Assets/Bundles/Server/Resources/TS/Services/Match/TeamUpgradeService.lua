-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ObjectUtil = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local Network = require("Shared/TS/Network").Network
local TeamUpgradeType = require("Shared/TS/TeamUpgrades/TeamUpgradeType").TeamUpgradeType
local TeamUpgradeUtil = require("Shared/TS/TeamUpgrades/TeamUpgradeUtil").TeamUpgradeUtil
local SetUtil = require("Shared/TS/Util/SetUtil").SetUtil
local Task = require("Shared/TS/Util/Task").Task
-- * Snapshot send delay after user connects.
local SNAPSHOT_SEND_DELAY = 2
local TeamUpgradeService
do
	TeamUpgradeService = setmetatable({}, {
		__tostring = function()
			return "TeamUpgradeService"
		end,
	})
	TeamUpgradeService.__index = TeamUpgradeService
	function TeamUpgradeService.new(...)
		local self = setmetatable({}, TeamUpgradeService)
		return self:constructor(...) or self
	end
	function TeamUpgradeService:constructor(teamService, entityService, playerService, generatorService, generatorSpawnService)
		self.teamService = teamService
		self.entityService = entityService
		self.playerService = playerService
		self.generatorService = generatorService
		self.generatorSpawnService = generatorSpawnService
		self.teamUpgradeMap = {}
	end
	function TeamUpgradeService:OnStart()
		-- Apply persistent upgrade effects.
		self:ApplyPersistentUpgradeEffects()
		-- Apply generator upgrade effects.
		self:ApplyGeneratorUpgradeEffects()
		-- Initialize on match start.
		ServerSignals.MatchStart:connect(function()
			self:InitializeTeamUpgrades()
		end)
		-- Handle incoming upgrade requests.
		Network.ClientToServer.TeamUpgrade.UpgradeRequest.Server:SetCallback(function(clientId, upgradeType, tier)
			local player = self.playerService:GetPlayerFromClientId(clientId)
			if not player then
				return false
			end
			return self:HandleUpgradePurchaseRequest(player, upgradeType, tier)
		end)
		-- Handle late joiners.
		ServerSignals.PlayerJoin:connect(function(event)
			Task:Delay(SNAPSHOT_SEND_DELAY, function()
				local team = event.player:GetTeam()
				if not team then
					return nil
				end
				local teamUpgradeMap = self.teamUpgradeMap[team]
				if not teamUpgradeMap then
					return nil
				end
				local dtos = ObjectUtil.values(teamUpgradeMap)
				Network.ServerToClient.TeamUpgrade.UpgradeSnapshot.Server:FireClient(event.player.clientId, dtos)
			end)
		end)
	end
	function TeamUpgradeService:ApplyPersistentUpgradeEffects()
		-- Damage.
		ServerSignals.EntityDamage:ConnectWithPriority(100, function(event)
			local _fromTeam = event.fromEntity
			if _fromTeam ~= nil then
				_fromTeam = _fromTeam.player
				if _fromTeam ~= nil then
					_fromTeam = _fromTeam:GetTeam()
				end
			end
			local fromTeam = _fromTeam
			if not fromTeam then
				return nil
			end
			local upgradeMapForTeam = self.teamUpgradeMap[fromTeam]
			if not upgradeMapForTeam then
				return nil
			end
			local _dAMAGE = TeamUpgradeType.DAMAGE
			local damageUpgradeState = upgradeMapForTeam[_dAMAGE]
			if not damageUpgradeState then
				return nil
			end
			local damageUpgradeTier = damageUpgradeState.currentUpgradeTier
			if damageUpgradeTier > 0 then
				local damageMultiplier = TeamUpgradeUtil:GetUpgradeTierForType(TeamUpgradeType.DAMAGE, damageUpgradeTier).value
				-- Apply multiplier.
				event.amount *= 1 + damageMultiplier / 100
			end
		end)
		-- Armor protection.
		ServerSignals.EntityDamage:ConnectWithPriority(100, function(event)
			local _entityTeam = event.entity.player
			if _entityTeam ~= nil then
				_entityTeam = _entityTeam:GetTeam()
			end
			local entityTeam = _entityTeam
			if not entityTeam then
				return nil
			end
			local upgradeMapForTeam = self.teamUpgradeMap[entityTeam]
			if not upgradeMapForTeam then
				return nil
			end
			local _aRMOR_PROTECTION = TeamUpgradeType.ARMOR_PROTECTION
			local armorProtectionUpgradeState = upgradeMapForTeam[_aRMOR_PROTECTION]
			if not armorProtectionUpgradeState then
				return nil
			end
			local armorProtectionUpgradeTier = armorProtectionUpgradeState.currentUpgradeTier
			if armorProtectionUpgradeTier > 0 then
				local damageReduction = TeamUpgradeUtil:GetUpgradeTierForType(TeamUpgradeType.ARMOR_PROTECTION, armorProtectionUpgradeTier).value
				-- Apply multiplier.
				event.amount *= damageReduction / 100
			end
		end)
		-- READ: Break speed handling lives in `BlockHitDamageCalc.ts`.
	end
	function TeamUpgradeService:ApplyGeneratorUpgradeEffects()
		ServerSignals.TeamUpgradePurchase:Connect(function(event)
			-- Handle team generator upgrades.
			if event.upgradeType == TeamUpgradeType.TEAM_GENERATOR then
				local ironGenerators = self.generatorSpawnService:GetTeamGeneratorByType(event.team, ItemType.IRON)
				local tierMeta = TeamUpgradeUtil:GetUpgradeTierForType(event.upgradeType, event.tier)
				local _exp = event.tier
				repeat
					local _fallthrough = false
					if _exp == 1 then
						-- Increase generator speed.
						local _result = ironGenerators
						if _result ~= nil then
							local _arg0 = function(generator)
								local newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100)
								self.generatorService:UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed)
							end
							for _k, _v in _result do
								_arg0(_v, _k - 1, _result)
							end
						end
						break
					end
					if _exp == 2 then
						-- Increase generator speed.
						local _result = ironGenerators
						if _result ~= nil then
							local _arg0 = function(generator)
								local newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100)
								self.generatorService:UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed)
							end
							for _k, _v in _result do
								_arg0(_v, _k - 1, _result)
							end
						end
						break
					end
					if _exp == 3 then
						-- Spawn emeralds.
						if ironGenerators and #ironGenerators > 0 then
							local emeraldGeneratorSpawnPos = ironGenerators[1].dto.pos
							local generatorId = self.generatorService:CreateGenerator(emeraldGeneratorSpawnPos, {
								item = ItemType.EMERALD,
								spawnRate = 45,
								stackLimit = 3,
								label = false,
							})
							self.generatorSpawnService:RegisterNewGeneratorForTeam(event.team, generatorId)
							break
						end
					end
				until true
			end
			-- Handle diamond generator upgrades.
			if event.upgradeType == TeamUpgradeType.DIAMOND_GENERATOR then
				local ironGenerators = self.generatorSpawnService:GetTeamGeneratorByType(event.team, ItemType.IRON)
				local tierMeta = TeamUpgradeUtil:GetUpgradeTierForType(event.upgradeType, event.tier)
				local _exp = event.tier
				repeat
					if _exp == 1 then
						-- Spawn diamonds.
						if ironGenerators and #ironGenerators > 0 then
							local diamondGeneratorSpawnPos = ironGenerators[1].dto.pos
							local generatorId = self.generatorService:CreateGenerator(diamondGeneratorSpawnPos, {
								item = ItemType.DIAMOND,
								spawnRate = 25,
								stackLimit = 6,
								label = false,
							})
							self.generatorSpawnService:RegisterNewGeneratorForTeam(event.team, generatorId)
						end
						break
					end
					if _exp == 2 then
						-- Increase diamond generator speed.
						local diamondGenerators = self.generatorSpawnService:GetTeamGeneratorByType(event.team, ItemType.DIAMOND)
						local _result = diamondGenerators
						if _result ~= nil then
							local _arg0 = function(generator)
								local newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100)
								self.generatorService:UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed)
							end
							for _k, _v in _result do
								_arg0(_v, _k - 1, _result)
							end
						end
						break
					end
					if _exp == 3 then
						-- Increase diamond generator speed.
						local diamondGenerators = self.generatorSpawnService:GetTeamGeneratorByType(event.team, ItemType.DIAMOND)
						local _result = diamondGenerators
						if _result ~= nil then
							local _arg0 = function(generator)
								local newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100)
								self.generatorService:UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed)
							end
							for _k, _v in _result do
								_arg0(_v, _k - 1, _result)
							end
						end
						break
					end
				until true
			end
		end)
	end
	function TeamUpgradeService:InitializeTeamUpgrades()
		local teams = self.teamService:GetTeams()
		local _arg0 = function(team)
			local defaultTeamUpgradeStates = {}
			local _exp = ObjectUtil.values(TeamUpgradeType)
			local _arg0_1 = function(upgradeType)
				local teamUpgradeMeta = TeamUpgradeUtil:GetTeamUpgradeMeta(upgradeType)
				local dto = {
					teamUpgrade = teamUpgradeMeta,
					teamId = team.id,
					currentUpgradeTier = 0,
				}
				local _upgradeType = upgradeType
				defaultTeamUpgradeStates[_upgradeType] = dto
			end
			for _k, _v in _exp do
				_arg0_1(_v, _k - 1, _exp)
			end
			local _teamUpgradeMap = self.teamUpgradeMap
			local _team = team
			_teamUpgradeMap[_team] = defaultTeamUpgradeStates
		end
		for _k, _v in teams do
			_arg0(_v, _k - 1, teams)
		end
	end
	function TeamUpgradeService:GetUpgradeStateForTeam(team, upgradeType)
		local _teamUpgradeMap = self.teamUpgradeMap
		local _team = team
		local _result = _teamUpgradeMap[_team]
		if _result ~= nil then
			local _upgradeType = upgradeType
			_result = _result[_upgradeType]
		end
		return _result
	end
	function TeamUpgradeService:GetUpgradeStateForPlayer(player, upgradeType)
		local playerTeam = player:GetTeam()
		if not playerTeam then
			return nil
		end
		return self:GetUpgradeStateForTeam(playerTeam, upgradeType)
	end
	function TeamUpgradeService:HandleUpgradePurchaseRequest(player, upgradeType, tier)
		local playerEntity = self.entityService:GetEntityByClientId(player.clientId)
		-- Validate entity.
		if not playerEntity or not (TS.instanceof(playerEntity, CharacterEntity)) then
			return false
		end
		local playerInv = playerEntity:GetInventory()
		local purchaseForTeam = player:GetTeam()
		-- Validate team.
		if not purchaseForTeam then
			return false
		end
		local _upgradeState = self.teamUpgradeMap[purchaseForTeam]
		if _upgradeState ~= nil then
			local _upgradeType = upgradeType
			_upgradeState = _upgradeState[_upgradeType]
		end
		local upgradeState = _upgradeState
		-- Validate update state.
		if not upgradeState then
			return false
		end
		local currentTier = upgradeState.currentUpgradeTier
		-- Validate that upgrade is not maxed out.
		local maxUpgrades = TeamUpgradeUtil:GetUpgradeTierCountForType(upgradeType)
		if currentTier == maxUpgrades then
			return false
		end
		-- Validate that tier request is next tier.
		if tier ~= currentTier + 1 then
			return false
		end
		local nextTier = currentTier + 1
		local nextTierMeta = TeamUpgradeUtil:GetUpgradeTierForType(upgradeType, nextTier)
		local canAfford = playerInv:HasEnough(nextTierMeta.currency, nextTierMeta.cost)
		-- Validate that player can afford upgrade.
		if not canAfford then
			return false
		end
		-- Accept upgrade request.
		playerInv:Decrement(nextTierMeta.currency, nextTierMeta.cost)
		upgradeState.currentUpgradeTier = math.clamp(upgradeState.currentUpgradeTier + 1, 1, maxUpgrades)
		ServerSignals.TeamUpgradePurchase:Fire({
			team = purchaseForTeam,
			upgradeType = upgradeType,
			tier = upgradeState.currentUpgradeTier,
		})
		local _exp = SetUtil:ToArray(purchaseForTeam:GetPlayers())
		local _arg0 = function(player)
			return player.clientId
		end
		-- ▼ ReadonlyArray.mapFiltered ▼
		local _newValue = {}
		local _length = 0
		for _k, _v in _exp do
			local _result = _arg0(_v, _k - 1, _exp)
			if _result ~= nil then
				_length += 1
				_newValue[_length] = _result
			end
		end
		-- ▲ ReadonlyArray.mapFiltered ▲
		local clientIds = _newValue
		local _arg0_1 = function(clientId)
			Network.ServerToClient.TeamUpgrade.UpgradeProcessed.Server:FireClient(clientId, player.clientId, upgradeType, upgradeState.currentUpgradeTier)
		end
		for _k, _v in clientIds do
			_arg0_1(_v, _k - 1, clientIds)
		end
		return true
	end
end
-- (Flamework) TeamUpgradeService metadata
Reflect.defineMetadata(TeamUpgradeService, "identifier", "Bundles/Server/Services/Match/TeamUpgradeService@TeamUpgradeService")
Reflect.defineMetadata(TeamUpgradeService, "flamework:parameters", { "Bundles/Server/Services/Global/Team/TeamService@TeamService", "Bundles/Server/Services/Global/Entity/EntityService@EntityService", "Bundles/Server/Services/Global/Player/PlayerService@PlayerService", "Bundles/Server/Services/Global/Generator/GeneratorService@GeneratorService", "Bundles/Server/Services/Match/GeneratorSpawnService@GeneratorSpawnService" })
Reflect.defineMetadata(TeamUpgradeService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(TeamUpgradeService, "$:flamework@Service", Service, { {} })
return {
	TeamUpgradeService = TeamUpgradeService,
}
-- ----------------------------------
-- ----------------------------------
