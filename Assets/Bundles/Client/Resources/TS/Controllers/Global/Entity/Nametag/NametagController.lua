-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Game = require("Shared/TS/Game").Game
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local Theme = require("Shared/TS/Util/Theme").Theme
local NametagController
do
	NametagController = setmetatable({}, {
		__tostring = function()
			return "NametagController"
		end,
	})
	NametagController.__index = NametagController
	function NametagController.new(...)
		local self = setmetatable({}, NametagController)
		return self:constructor(...) or self
	end
	function NametagController:constructor(playerController, entityController)
		self.playerController = playerController
		self.entityController = entityController
		self.nameTageId = "Nametag"
		self.graphicsBundleName = "Graphics"
		self.showSelfNametag = false
	end
	function NametagController:OnStart()
		ClientSignals.EntitySpawn:ConnectWithPriority(100, function(event)
			if event.Entity:IsLocalCharacter() and not self.showSelfNametag then
				return nil
			end
			self:CreateNametag(event.Entity)
		end)
		ClientSignals.PlayerChangeTeam:Connect(function(event)
			if event.Player == Game.LocalPlayer then
				for _, entity in self.entityController:GetEntities() do
					self:UpdateNametag(entity)
				end
				return nil
			end
			if event.Player.Character then
				self:UpdateNametag(event.Player.Character)
			end
		end)
	end
	function NametagController:CreateNametag(entity)
		local nametagPrefab = AssetBridge:LoadAsset("Client/Resources/Prefabs/Nametag.prefab")
		local nametag = GameObjectBridge:Instantiate(nametagPrefab)
		nametag.name = self.nameTageId
		nametag.transform.parent = entity.model.transform
		nametag.transform.localPosition = Vector3.new(0, 2.3, 0)
		self:UpdateNametag(entity)
		return nametag
	end
	function NametagController:UpdateNametag(entity)
		local _team = entity.player
		if _team ~= nil then
			_team = _team:GetTeam()
		end
		local team = _team
		local localTeam = Game.LocalPlayer:GetTeam()
		local nameTag = entity.model.transform:FindChild(self.nameTageId)
		if nameTag == nil then
			self:CreateNametag(entity)
			return nil
		end
		local references = nameTag.gameObject:GetComponent("GameObjectReferences")
		local textLabel = references:GetValue(self.graphicsBundleName, "Text")
		local teamImage = references:GetValue(self.graphicsBundleName, "Team")
		-- Username text
		local displayName = "Entity" .. tostring(entity.id)
		if entity.player then
			displayName = entity.player.username
		end
		textLabel.text = displayName
		-- Username color
		local color
		if localTeam then
			local _condition = entity.player
			if _condition then
				local _exp = localTeam:GetPlayers()
				local _player = entity.player
				_condition = _exp[_player] ~= nil
			end
			if _condition then
				color = Theme.Green
			else
				color = Theme.Red
			end
		end
		if color == nil then
			color = Theme.White
		end
		textLabel.color = color
		-- Team image
		if team then
			teamImage.color = team.color
			teamImage.enabled = true
		else
			teamImage.enabled = false
		end
	end
end
-- (Flamework) NametagController metadata
Reflect.defineMetadata(NametagController, "identifier", "Bundles/Client/Controllers/Global/Entity/Nametag/NametagController@NametagController")
Reflect.defineMetadata(NametagController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController", "Bundles/Client/Controllers/Global/Entity/EntityController@EntityController" })
Reflect.defineMetadata(NametagController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(NametagController, "$:flamework@Controller", Controller, { {} })
return {
	NametagController = NametagController,
}
-- ----------------------------------
-- ----------------------------------
