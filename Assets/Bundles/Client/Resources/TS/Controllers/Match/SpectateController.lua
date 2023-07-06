-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local OrbitCameraMode = require("Client/TS/Controllers/Global/Camera/DefaultCameraModes/OrbitCameraMode").OrbitCameraMode
local Entity = require("Shared/TS/Entity/Entity").Entity
local Game = require("Shared/TS/Game").Game
local Mouse = require("Shared/TS/UserInput/init").Mouse
local Bin = require("Shared/TS/Util/Bin").Bin
local SpectateController
do
	SpectateController = setmetatable({}, {
		__tostring = function()
			return "SpectateController"
		end,
	})
	SpectateController.__index = SpectateController
	function SpectateController.new(...)
		local self = setmetatable({}, SpectateController)
		return self:constructor(...) or self
	end
	function SpectateController:constructor(cameraController, entityController, bwController)
		self.cameraController = cameraController
		self.entityController = entityController
		self.bwController = bwController
		self.spectateCamDistance = 5
		self.spectateIndex = 0
		self.currentlySpectatingEntityId = 0
	end
	function SpectateController:OnStart()
		-- Start spectating once player is eliminated:
		ClientSignals.PlayerEliminated:Connect(function(event)
			if event.player ~= Game.LocalPlayer then
				return nil
			end
			self:StartSpectating()
		end)
	end
	function SpectateController:ObserveSpectatorTarget(callback)
		local cleanup
		local found = false
		local _value = self.currentlySpectatingEntityId
		if _value ~= 0 and (_value == _value and _value) then
			local entity = Entity:FindById(self.currentlySpectatingEntityId)
			if entity then
				found = true
				cleanup = callback(entity)
			end
		end
		if not found then
			cleanup = callback(nil)
		end
		local bin = Bin.new()
		bin:Add(ClientSignals.SpectatorTargetChanged:Connect(function(event)
			local _result = cleanup
			if _result ~= nil then
				_result()
			end
			cleanup = callback(event.entity)
		end))
		return function()
			bin:Clean()
		end
	end
	function SpectateController:StartSpectating()
		local entities = self:GetSortedEntities()
		if #entities == 0 then
			return nil
		end
		local bin = Bin.new()
		local orbitCamMode = OrbitCameraMode.new(entities[1].model.transform, self.spectateCamDistance)
		self.cameraController:SetMode(orbitCamMode)
		self:GoToIncrement(orbitCamMode, 0)
		-- Handle changing who is spectated:
		local mouse = bin:Add(Mouse.new())
		mouse.LeftDown:Connect(function()
			self:GoToIncrement(orbitCamMode, 1)
		end)
		mouse.RightDown:Connect(function()
			self:GoToIncrement(orbitCamMode, -1)
		end)
		bin:Connect(ClientSignals.EntitySpawn, function(event)
			self:FitIndexToId()
		end)
		bin:Connect(ClientSignals.EntityDespawn, function(entity)
			-- If currently-spectated entity goes away, switch to the next entity:
			if entity.id == self.currentlySpectatingEntityId then
				self:FitIndexToId()
				self:GoToIncrement(orbitCamMode, 1)
			else
				self:FitIndexToId()
			end
		end)
		-- Clean up after camera mode is changed:
		bin:Connect(self.cameraController.cameraSystem.ModeChangedBegin, function(newMode, oldMode)
			if oldMode == orbitCamMode then
				bin:Clean()
			end
		end)
	end
	function SpectateController:FitIndexToId()
		local _fn = math
		local _exp = self:GetSortedEntities()
		local _arg0 = function(e)
			return e.id == self.currentlySpectatingEntityId
		end
		-- ▼ ReadonlyArray.findIndex ▼
		local _result = -1
		for _i, _v in _exp do
			if _arg0(_v, _i - 1, _exp) == true then
				_result = _i - 1
				break
			end
		end
		-- ▲ ReadonlyArray.findIndex ▲
		self.spectateIndex = _fn.max(0, _result)
	end
	function SpectateController:GoToIncrement(mode, inc)
		local entities = self:GetSortedEntities()
		self.spectateIndex = (self.spectateIndex + inc) % #entities
		local entity = entities[self.spectateIndex + 1]
		self.currentlySpectatingEntityId = entity.id
		mode:SetTransform(entity.model.transform)
		ClientSignals.SpectatorTargetChanged:Fire({
			entity = entity,
		})
	end
	function SpectateController:GetSortedEntities()
		local team = Game.LocalPlayer:GetTeam()
		local _result
		if team then
			local _exp = self.bwController:GetAlivePlayersOnTeam(team)
			local _arg0 = function(player)
				return player.Character ~= nil
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
			local _arg0_1 = function(player)
				return player.Character
			end
			-- ▼ ReadonlyArray.map ▼
			local _newValue_1 = table.create(#_newValue)
			for _k, _v in _newValue do
				_newValue_1[_k] = _arg0_1(_v, _k - 1, _newValue)
			end
			-- ▲ ReadonlyArray.map ▲
			_result = _newValue_1
		else
			_result = self.entityController:GetEntities()
		end
		local entities = _result
		local _arg0 = function(a, b)
			return a.id < b.id
		end
		table.sort(entities, _arg0)
		return entities
	end
end
-- (Flamework) SpectateController metadata
Reflect.defineMetadata(SpectateController, "identifier", "Bundles/Client/Controllers/Match/SpectateController@SpectateController")
Reflect.defineMetadata(SpectateController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Camera/CameraController@CameraController", "Bundles/Client/Controllers/Global/Entity/EntityController@EntityController", "Bundles/Client/Controllers/Match/BWController@BWController" })
Reflect.defineMetadata(SpectateController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(SpectateController, "$:flamework@Controller", Controller, { {} })
return {
	SpectateController = SpectateController,
}
-- ----------------------------------
-- ----------------------------------
