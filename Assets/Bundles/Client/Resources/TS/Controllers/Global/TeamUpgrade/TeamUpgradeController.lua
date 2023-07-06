-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ObjectUtil = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local Game = require("Shared/TS/Game").Game
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local Network = require("Shared/TS/Network").Network
local TeamUpgradeType = require("Shared/TS/TeamUpgrades/TeamUpgradeType").TeamUpgradeType
local TeamUpgradeUtil = require("Shared/TS/TeamUpgrades/TeamUpgradeUtil").TeamUpgradeUtil
local BedWarsUI = require("Shared/TS/UI/BedWarsUI").BedWarsUI
local AppManager = require("Shared/TS/Util/AppManager").AppManager
local Bin = require("Shared/TS/Util/Bin").Bin
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local TeamUpgradeController
do
	TeamUpgradeController = setmetatable({}, {
		__tostring = function()
			return "TeamUpgradeController"
		end,
	})
	TeamUpgradeController.__index = TeamUpgradeController
	function TeamUpgradeController.new(...)
		local self = setmetatable({}, TeamUpgradeController)
		return self:constructor(...) or self
	end
	function TeamUpgradeController:constructor()
		self.localUpgradeMap = {}
		local go = GameObject:Find("TeamUpgradeShop")
		self.canvas = go:GetComponent("Canvas")
		self.content = self.canvas.transform:FindChild("Content")
		local i = 0
		local ordered = { TeamUpgradeType.TEAM_GENERATOR, TeamUpgradeType.DIAMOND_GENERATOR, TeamUpgradeType.DAMAGE, TeamUpgradeType.ARMOR_PROTECTION, TeamUpgradeType.BREAK_SPEED }
		local _arg0 = function(upgradeType)
			local card = self.content:GetChild(i)
			card.gameObject.name = upgradeType
			local teamUpgradeMeta = TeamUpgradeUtil:GetTeamUpgradeMeta(upgradeType)
			local _object = {
				teamUpgrade = teamUpgradeMeta,
			}
			local _left = "teamId"
			local _result = Game.LocalPlayer:GetTeam()
			if _result ~= nil then
				_result = _result.id
			end
			local _condition = _result
			if _condition == nil then
				_condition = "0"
			end
			_object[_left] = _condition
			_object.currentUpgradeTier = 0
			local dto = _object
			local _localUpgradeMap = self.localUpgradeMap
			local _upgradeType = upgradeType
			_localUpgradeMap[_upgradeType] = dto
			self:UpdateCard(upgradeType, true)
			i += 1
		end
		for _k, _v in ordered do
			_arg0(_v, _k - 1, ordered)
		end
	end
	function TeamUpgradeController:OnStart()
		-- Sync up existing server state, if applicable.
		Network.ServerToClient.TeamUpgrade.UpgradeSnapshot.Client:OnServerEvent(function(dtos)
			local _dtos = dtos
			local _arg0 = function(dto)
				self:HandleUpgradeStateChange(dto.teamUpgrade.type, dto.currentUpgradeTier)
			end
			for _k, _v in _dtos do
				_arg0(_v, _k - 1, _dtos)
			end
		end)
		-- Handle incoming team upgrade state change.
		Network.ServerToClient.TeamUpgrade.UpgradeProcessed.Client:OnServerEvent(function(purchaserClientId, upgradeType, tier)
			self:HandleUpgradeStateChange(upgradeType, tier)
		end)
	end
	function TeamUpgradeController:HandleUpgradeStateChange(upgradeType, tier)
		-- Update local client state.
		local _localUpgradeMap = self.localUpgradeMap
		local _upgradeType = upgradeType
		local state = _localUpgradeMap[_upgradeType]
		if state then
			state.currentUpgradeTier = tier
		end
		self:UpdateCard(upgradeType)
	end
	function TeamUpgradeController:UpdateUI()
		local i = 0
		local _exp = ObjectUtil.values(TeamUpgradeType)
		local _arg0 = function(upgradeType)
			self:UpdateCard(upgradeType)
			i += 1
		end
		for _k, _v in _exp do
			_arg0(_v, _k - 1, _exp)
		end
	end
	function TeamUpgradeController:UpdateCard(upgradeType, init)
		if init == nil then
			init = false
		end
		local _localUpgradeMap = self.localUpgradeMap
		local _upgradeType = upgradeType
		local state = _localUpgradeMap[_upgradeType]
		local _result = state
		if _result ~= nil then
			_result = _result.currentUpgradeTier
		end
		local _condition = _result
		if _condition == nil then
			_condition = 0
		end
		local tier = _condition
		local card = self:GetUpgradeCard(upgradeType)
		local refs = card:GetComponent("GameObjectReferences")
		local titleText = refs:GetValue("UI", "TitleText")
		local priceText = refs:GetValue("UI", "PriceText")
		local buttonImage = refs:GetValue("UI", "ButtonImage")
		local buttonText = refs:GetValue("UI", "ButtonText")
		local tier1Text = refs:GetValue("UI", "Tier1Text")
		local tier2Text = refs:GetValue("UI", "Tier2Text")
		local tier3Text = refs:GetValue("UI", "Tier3Text")
		local buttonGO = buttonImage.gameObject
		-- Update references.
		local upgradeMeta = TeamUpgradeUtil:GetTeamUpgradeMeta(upgradeType)
		titleText.text = upgradeMeta.displayName
		-- Tier 1
		local tier1Meta = TeamUpgradeUtil:GetUpgradeTierForType(upgradeType, 1)
		tier1Text.text = tier1Meta.description
		if tier >= 1 then
			tier1Text.color = Color.new(1, 1, 1, 1)
		else
			tier1Text.color = Color.new(1, 1, 1, 0.5)
		end
		-- Tier 2
		local tier2Meta = TeamUpgradeUtil:GetUpgradeTierForType(upgradeType, 2)
		tier2Text.text = tier2Meta.description
		if tier >= 2 then
			tier2Text.color = Color.new(1, 1, 1, 1)
		else
			tier2Text.color = Color.new(1, 1, 1, 0.5)
		end
		-- Tier 3.
		local tier3Meta = TeamUpgradeUtil:GetUpgradeTierForType(upgradeType, 3)
		tier3Text.text = tier3Meta.description
		if tier >= 3 then
			tier3Text.color = Color.new(1, 1, 1, 1)
		else
			tier3Text.color = Color.new(1, 1, 1, 0.5)
		end
		-- Price
		repeat
			if tier == 0 then
				priceText.text = tostring(tier1Meta.cost) .. (" " .. GetItemMeta(tier1Meta.currency).displayName)
				break
			end
			if tier == 1 then
				priceText.text = tostring(tier2Meta.cost) .. (" " .. GetItemMeta(tier2Meta.currency).displayName)
				break
			end
			if tier == 2 then
				priceText.text = tostring(tier3Meta.cost) .. (" " .. GetItemMeta(tier3Meta.currency).displayName)
				break
			end
			priceText.enabled = false
		until true
		if tier < 3 then
			local canPurchase = false
			if tier < #upgradeMeta.tiers then
				local _result_1 = Game.LocalPlayer.Character
				if _result_1 ~= nil then
					_result_1 = _result_1:GetInventory():HasEnough(upgradeMeta.tiers[tier + 1].currency, upgradeMeta.tiers[tier + 1].cost)
				end
				if _result_1 then
					canPurchase = true
				end
			end
			if canPurchase then
				buttonImage.color = Color.new(0.25, 0.72, 0.36, 1)
				buttonText.text = "Purchase"
			else
				buttonImage.color = Color.new(0.67, 0.07, 0.15, 1)
				buttonText.text = "Not Enough"
			end
		else
			buttonImage.enabled = false
			buttonText.enabled = false
		end
		if init then
			BedWarsUI:SetupButton(buttonGO)
			CanvasAPI:OnClickEvent(buttonGO, function()
				local _localUpgradeMap_1 = self.localUpgradeMap
				local _upgradeType_1 = upgradeType
				local _currentTier = _localUpgradeMap_1[_upgradeType_1]
				if _currentTier ~= nil then
					_currentTier = _currentTier.currentUpgradeTier
				end
				local currentTier = _currentTier
				if currentTier ~= nil then
					local nextTier = currentTier + 1
					local result = Network.ClientToServer.TeamUpgrade.UpgradeRequest.Client:FireServer(upgradeType, nextTier)
					if result then
						SoundUtil:PlayGlobal("ItemShopPurchase.wav")
					end
				end
			end)
		end
	end
	function TeamUpgradeController:Open()
		self:UpdateUI()
		local bin = Bin.new()
		local _inv = Game.LocalPlayer.Character
		if _inv ~= nil then
			_inv = _inv:GetInventory()
		end
		local inv = _inv
		if inv then
			inv.Changed:Connect(function()
				self:UpdateUI()
			end)
		end
		AppManager:Open(self.canvas, {
			onClose = function()
				bin:Clean()
			end,
		})
	end
	function TeamUpgradeController:GetUpgradeCard(upgradeType)
		return self.content:FindChild(upgradeType).gameObject
	end
end
-- (Flamework) TeamUpgradeController metadata
Reflect.defineMetadata(TeamUpgradeController, "identifier", "Bundles/Client/Controllers/Global/TeamUpgrade/TeamUpgradeController@TeamUpgradeController")
Reflect.defineMetadata(TeamUpgradeController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(TeamUpgradeController, "$:flamework@Controller", Controller, { {} })
return {
	TeamUpgradeController = TeamUpgradeController,
}
-- ----------------------------------
-- ----------------------------------
