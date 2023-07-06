-- Compiled with unity-ts v2.1.0-75
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local MobileJoystick = _UserInput.MobileJoystick
local Preferred = _UserInput.Preferred
local Bin = require("Shared/TS/Util/Bin").Bin
local OnUpdate = require("Shared/TS/Util/Timer").OnUpdate
local EntityInput
do
	EntityInput = setmetatable({}, {
		__tostring = function()
			return "EntityInput"
		end,
	})
	EntityInput.__index = EntityInput
	function EntityInput.new(...)
		local self = setmetatable({}, EntityInput)
		return self:constructor(...) or self
	end
	function EntityInput:constructor(characterGO)
		self.characterGO = characterGO
		self.bin = Bin.new()
		self.disablers = {}
		self.disablerCounter = 1
		self.jumping = false
		self.enabled = true
		self.entityDriver = characterGO:GetComponent("EntityDriver")
		self:InitControls()
	end
	function EntityInput:SetEnabled(enabled)
		self.enabled = enabled
		if not enabled then
			self.entityDriver:SetMoveInput(Vector3.zero, false, false, false)
		end
	end
	function EntityInput:IsEnabled()
		return self.enabled
	end
	function EntityInput:AddDisabler()
		local id = self.disablerCounter
		self.disablerCounter += 1
		self.disablers[id] = true
		self:SetEnabled(false)
		return function()
			self.disablers[id] = nil
			-- ▼ ReadonlySet.size ▼
			local _size = 0
			for _ in self.disablers do
				_size += 1
			end
			-- ▲ ReadonlySet.size ▲
			if _size == 0 then
				self:SetEnabled(true)
			else
				self:SetEnabled(false)
			end
		end
	end
	function EntityInput:InitControls()
		local keyboard = self.bin:Add(Keyboard.new())
		local mobileJoystick = self.bin:Add(MobileJoystick.new())
		local preferred = self.bin:Add(Preferred.new())
		local updateMouseKeyboardControls = function(dt)
			if not self.enabled then
				return nil
			end
			local success, err = pcall(function()
				local jump = keyboard:IsKeyDown(1)
				local w = keyboard:IsEitherKeyDown(37, 63)
				local s = keyboard:IsEitherKeyDown(33, 64)
				local a = keyboard:IsKeyDown(15)
				local d = keyboard:IsKeyDown(18)
				local leftShift = keyboard:IsKeyDown(51)
				local leftCtrl = keyboard:IsKeyDown(55)
				local c = keyboard:IsKeyDown(17)
				local forward = if w == s then 0 elseif w then 1 else -1
				local sideways = if d == a then 0 elseif d then 1 else -1
				local moveDirection = Vector3.new(sideways, 0, forward)
				if self.jumping ~= jump then
					self.jumping = jump
				end
				self.entityDriver:SetMoveInput(moveDirection, jump, leftShift, leftCtrl or c)
			end)
			if not success then
				print(err)
			end
		end
		local onMobileJoystickChanged = function(position, phase)
			if not self.enabled then
				return nil
			end
			self.entityDriver:SetMoveInput(position, false, false, false)
		end
		-- Switch controls based on preferred user input:
		preferred:ObserveControlScheme(function(controlScheme)
			local controlSchemeBin = Bin.new()
			repeat
				if controlScheme == "MouseKeyboard" then
					mobileJoystick:SetVisible(false)
					controlSchemeBin:Connect(OnUpdate, updateMouseKeyboardControls)
					break
				end
				if controlScheme == "Touch" then
					mobileJoystick:SetVisible(true)
					controlSchemeBin:Connect(mobileJoystick.Changed, onMobileJoystickChanged)
					break
				end
				print("unknown control scheme: " .. tostring(controlScheme))
				break
			until true
			-- Clean up current controls when preferred input scheme changes:
			return function()
				controlSchemeBin:Destroy()
			end
		end)
	end
	function EntityInput:Destroy()
		self.bin:Destroy()
	end
end
return {
	EntityInput = EntityInput,
}
-- ----------------------------------
-- ----------------------------------
