-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Game = require("Shared/TS/Game").Game
local Network = require("Shared/TS/Network").Network
local Keyboard = require("Shared/TS/UserInput/init").Keyboard
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
local Task = require("Shared/TS/Util/Task").Task
local FlyCameraMode = require("Client/TS/Controllers/Global/Camera/DefaultCameraModes/FlyCameraMode").FlyCameraMode
local HumanoidCameraMode = require("Client/TS/Controllers/Global/Camera/DefaultCameraModes/HumanoidCameraMode").HumanoidCameraMode
local FirstPersonCameraSystem = require("Client/TS/Controllers/Global/Camera/FirstPersonCameraSystem").FirstPersonCameraSystem
local EntityInput = require("Client/TS/Controllers/Global/Character/EntityInput").EntityInput
local CAM_Y_OFFSET = 1.85
local CAM_Y_OFFSET_CROUCH_1ST_PERSON = CAM_Y_OFFSET / 1.5
local CAM_Y_OFFSET_CROUCH_3RD_PERSON = CAM_Y_OFFSET
local LocalEntityController
do
	LocalEntityController = setmetatable({}, {
		__tostring = function()
			return "LocalEntityController"
		end,
	})
	LocalEntityController.__index = LocalEntityController
	function LocalEntityController.new(...)
		local self = setmetatable({}, LocalEntityController)
		return self:constructor(...) or self
	end
	function LocalEntityController:constructor(cameraController, clientSettings)
		self.cameraController = cameraController
		self.clientSettings = clientSettings
		self.firstPerson = true
		self.lookBackwards = false
		self.FirstPersonChanged = Signal.new()
		self.LookBackwardsChanged = Signal.new()
		self.customDataQueue = {}
		self.prevState = 0
		self.currentState = 0
	end
	function LocalEntityController:IsFirstPerson()
		return self.firstPerson
	end
	function LocalEntityController:ObserveFirstPerson(observer)
		local currentCleanup
		local onChanged = function(isFirstPerson)
			local _result = currentCleanup
			if _result ~= nil then
				_result()
			end
			currentCleanup = observer(isFirstPerson)
		end
		local disconnect = self.FirstPersonChanged:Connect(onChanged)
		onChanged(self.firstPerson)
		return function()
			disconnect()
			local _result = currentCleanup
			if _result ~= nil then
				_result()
			end
		end
	end
	function LocalEntityController:ObserveLookBackwards(observer)
		local currentCleanup
		local onChanged = function(lookBackwards)
			local _result = currentCleanup
			if _result ~= nil then
				_result()
			end
			currentCleanup = observer(lookBackwards)
		end
		local disconnect = self.LookBackwardsChanged:Connect(onChanged)
		onChanged(self.lookBackwards)
		return function()
			disconnect()
			local _result = currentCleanup
			if _result ~= nil then
				_result()
			end
		end
	end
	function LocalEntityController:AddToMoveData(key, value)
		local _customDataQueue = self.customDataQueue
		local _arg0 = {
			key = key,
			value = value,
		}
		table.insert(_customDataQueue, _arg0)
		local blob = BinaryBlob.new(self.customDataQueue)
		local _result = self.entityDriver
		if _result ~= nil then
			_result:SetCustomData(blob)
		end
	end
	function LocalEntityController:TakeScreenshot()
		local screenshotFilename = os.date("Screenshot-%Y-%m-%d-%H-%M-%S.png")
		print("Capturing screenshot " .. screenshotFilename)
		ScreenCapture:CaptureScreenshot(screenshotFilename)
	end
	function LocalEntityController:OnStart()
		Game.LocalPlayer:ObserveCharacter(function(entity)
			if not entity then
				return nil
			end
			local bin = Bin.new()
			local keyboard = bin:Add(Keyboard.new())
			self.entityDriver = entity.gameObject:GetComponent("EntityDriver")
			self.entityInput = EntityInput.new(entity.gameObject)
			local humanoidCameraMode
			-- Custom move data control:
			-- bin.Add(
			-- OnUpdate.ConnectWithPriority(SignalPriority.MONITOR, () => {
			-- print("LocalEntityController.ts update");
			-- if (this.customDataQueue.size() === 0) return;
			-- const blob = new BinaryBlob(this.customDataQueue);
			-- print("[TS]: SetCustomData()");
			-- entityDriver.SetCustomData(blob);
			-- }),
			-- );
			self.entityDriver:OnCustomDataFlushed(function()
				table.clear(self.customDataQueue)
			end)
			local getCamYOffset = function(state, isFirstPerson)
				local yOffset = if state == 5 or state == 4 then if isFirstPerson then CAM_Y_OFFSET_CROUCH_1ST_PERSON else CAM_Y_OFFSET_CROUCH_3RD_PERSON else CAM_Y_OFFSET
				return yOffset
			end
			-- Set up camera
			local createHumanoidCameraMode = function()
				local _result = self.entityDriver
				if _result ~= nil then
					_result = _result:GetState()
				end
				local _condition = _result
				if _condition == nil then
					_condition = 0
				end
				local state = _condition
				local yOffset = getCamYOffset(state, self.firstPerson)
				humanoidCameraMode = HumanoidCameraMode.new(entity.gameObject, entity.model, self.firstPerson, yOffset)
				humanoidCameraMode:SetLookBackwards(self.lookBackwards)
				return humanoidCameraMode
			end
			self.FirstPersonChanged:Connect(function(isFirstPerson)
				local _fn = humanoidCameraMode
				local _result = self.entityDriver
				if _result ~= nil then
					_result = _result:GetState()
				end
				local _condition = _result
				if _condition == nil then
					_condition = 0
				end
				_fn:SetYOffset(getCamYOffset(_condition, isFirstPerson), true)
			end)
			-- Set up first person camera
			self.fps = FirstPersonCameraSystem.new(entity.references, entity.dynamicVariables)
			self.fps:OnFirstPersonChanged(self.firstPerson)
			self.cameraController:SetMode(createHumanoidCameraMode())
			self.cameraController.cameraSystem:SetOnClearCallback(createHumanoidCameraMode)
			-- this.entityDriver.OnSecondaryStateChanged((state) => {
			-- humanoidCameraMode.SetYOffset(getCamYOffset(state, this.firstPerson));
			-- });
			self.entityDriver:OnStateChanged(function(state)
				if state ~= self.currentState then
					self.prevState = self.currentState
					self.currentState = state
				end
				humanoidCameraMode:SetYOffset(getCamYOffset(state, self.firstPerson))
				self:UpdateFov()
			end)
			local flyCam = false
			local flyingBin = Bin.new()
			bin:Connect(keyboard.KeyDown, function(event)
				-- Toggle first-person view:
				if event.Key == 34 then
					if self.cameraController.cameraSystem:GetMode() == humanoidCameraMode then
						self:ToggleFirstPerson(humanoidCameraMode)
					end
				elseif event.Key == 53 then
					if self.cameraController.cameraSystem:GetMode() == humanoidCameraMode then
						self:SetLookBackwards(humanoidCameraMode, true)
					end
				elseif event.Key == 30 and keyboard:IsKeyDown(51) then
					if RunCore:IsEditor() then
						flyCam = not flyCam
						if flyCam then
							if self.entityInput then
								flyingBin:Add(self.entityInput:AddDisabler())
							end
							self.cameraController:SetMode(FlyCameraMode.new())
						else
							flyingBin:Clean()
							self.cameraController:ClearMode()
						end
					end
				elseif event.Key == 27 and keyboard:IsKeyDown(51) then
					self:TakeScreenshot()
				elseif event.Key == 26 then
					print("-----")
					for _, entity in (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Entity/EntityController@EntityController")):GetEntities() do
						print(entity:GetDisplayName() .. ": " .. tostring(entity.id))
					end
					print("-----")
					-- TEST: Knock-back:
					Task:Spawn(function()
						local sentTick = InstanceFinder.TimeManager.Tick
						local halfWay = Network.ClientToServer.TEST_LATENCY.Client:FireServer()
						local endTick = InstanceFinder.TimeManager.Tick
						print("Round trip: " .. tostring((endTick - sentTick)) .. " | trip 1: " .. tostring((halfWay - sentTick)) .. " | trip 2: " .. tostring((endTick - halfWay)))
					end)
				end
			end)
			bin:Connect(keyboard.KeyUp, function(event)
				if event.Key == 53 then
					if self.cameraController.cameraSystem:GetMode() == humanoidCameraMode then
						self:SetLookBackwards(humanoidCameraMode, false)
					end
				end
			end)
			-- Cleanup:
			bin:Add(function()
				self.cameraController.cameraSystem:SetOnClearCallback(nil)
				self.cameraController:ClearMode()
				local _result = self.fps
				if _result ~= nil then
					_result:Destroy()
				end
				local _result_1 = self.entityInput
				if _result_1 ~= nil then
					_result_1:Destroy()
				end
			end)
			return function()
				bin:Clean()
			end
		end)
	end
	function LocalEntityController:UpdateFov()
		local baseFov = if self:IsFirstPerson() then self.clientSettings:GetFirstPersonFov() else self.clientSettings:GetThirdPersonFov()
		if self.currentState == 3 or (self.currentState == 4 or (self.currentState == 2 and self.prevState == 3)) then
			self.cameraController:SetFOV(baseFov * 1.08, false)
		else
			self.cameraController:SetFOV(baseFov, false)
		end
	end
	function LocalEntityController:SetLookBackwards(humanoidCameraMode, lookBackwards)
		if self.lookBackwards == lookBackwards then
			return nil
		end
		self.lookBackwards = lookBackwards
		self.LookBackwardsChanged:Fire(self.lookBackwards)
		if self.cameraController.cameraSystem:GetMode() == humanoidCameraMode then
			humanoidCameraMode:SetLookBackwards(self.lookBackwards)
		end
	end
	function LocalEntityController:ToggleFirstPerson(humanoidCameraMode)
		self.firstPerson = not self.firstPerson
		self.FirstPersonChanged:Fire(self.firstPerson)
		if self.cameraController.cameraSystem:GetMode() == humanoidCameraMode then
			humanoidCameraMode:SetFirstPerson(self.firstPerson)
		end
		local _result = self.fps
		if _result ~= nil then
			_result:OnFirstPersonChanged(self.firstPerson)
		end
	end
	function LocalEntityController:GetEntityInput()
		return self.entityInput
	end
end
-- (Flamework) LocalEntityController metadata
Reflect.defineMetadata(LocalEntityController, "identifier", "Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")
Reflect.defineMetadata(LocalEntityController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Camera/CameraController@CameraController", "Bundles/Client/Controllers/Global/ClientSettings/ClientSettingsController@ClientSettingsController" })
Reflect.defineMetadata(LocalEntityController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(LocalEntityController, "$:flamework@Controller", Controller, { {
	loadOrder = 10000,
} })
return {
	LocalEntityController = LocalEntityController,
}
-- ----------------------------------
-- ----------------------------------
