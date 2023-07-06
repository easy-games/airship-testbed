-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Game = require("Shared/TS/Game").Game
local Keyboard = require("Shared/TS/UserInput/init").Keyboard
local Task = require("Shared/TS/Util/Task").Task
-- * Prompt poll rate, how frequently we update `activatableProximityPrompts`.
local PROMPT_POLL_RATE = 0.1
local ProximityPromptController
do
	ProximityPromptController = setmetatable({}, {
		__tostring = function()
			return "ProximityPromptController"
		end,
	})
	ProximityPromptController.__index = ProximityPromptController
	function ProximityPromptController.new(...)
		local self = setmetatable({}, ProximityPromptController)
		return self:constructor(...) or self
	end
	function ProximityPromptController:constructor()
		self.keyboard = Keyboard.new()
		self.proximityPrompts = {}
		self.activatableProximityPrompts = {}
		self.activatableKeycodes = {}
	end
	function ProximityPromptController:OnStart()
		-- Listen for prompt creation.
		ClientSignals.ProximityPromptCreated:Connect(function(event)
			local _proximityPrompts = self.proximityPrompts
			local _prompt = event.prompt
			table.insert(_proximityPrompts, _prompt)
		end)
		-- Listen for keypresses for prompt activation.
		self.keyboard.KeyDown:Connect(function(event)
			self:HandleKeypress(event.Key)
		end)
		-- Start conditionally displaying prompts.
		self:FindActivatablePrompts()
	end
	function ProximityPromptController:HandleKeypress(key)
		local _activatableProximityPrompts = self.activatableProximityPrompts
		local _arg0 = function(prompt)
			return prompt.data.activationKey == key
		end
		-- ▼ ReadonlyArray.find ▼
		local _result
		for _i, _v in _activatableProximityPrompts do
			if _arg0(_v, _i - 1, _activatableProximityPrompts) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		local eligiblePrompt = _result
		if eligiblePrompt then
			eligiblePrompt:ActivatePrompt()
		end
	end
	function ProximityPromptController:GetDistanceToPrompt(prompt)
		-- If local character does _not_ have a position, fallback to `math.huge`.
		local _localCharacterPosition = Game.LocalPlayer.Character
		if _localCharacterPosition ~= nil then
			_localCharacterPosition = _localCharacterPosition.gameObject.transform.position
		end
		local localCharacterPosition = _localCharacterPosition
		if not localCharacterPosition then
			return math.huge
		end
		-- Otherwise, return distance.
		local _promptPosition = prompt.data.promptPosition
		return (localCharacterPosition - _promptPosition).magnitude
	end
	function ProximityPromptController:FindActivatablePrompts()
		Task:Spawn(function()
			Task:Repeat(PROMPT_POLL_RATE, function()
				local _proximityPrompts = self.proximityPrompts
				local _arg0 = function(prompt)
					local distToPrompt = self:GetDistanceToPrompt(prompt)
					if distToPrompt <= prompt.data.activationRange then
						local alreadyActive = self:GetActivePromptIndexById(prompt.id) > -1
						local _activatableKeycodes = self.activatableKeycodes
						local _activationKey = prompt.data.activationKey
						local keycodeActive = _activatableKeycodes[_activationKey] ~= nil
						--[[
							* If prompt is already active or prompt with same keycode is active,
							* do nothing. Otherwise, display prompt.
						]]
						if not alreadyActive and not keycodeActive then
							local _activatableKeycodes_1 = self.activatableKeycodes
							local _activationKey_1 = prompt.data.activationKey
							_activatableKeycodes_1[_activationKey_1] = true
							local _activatableProximityPrompts = self.activatableProximityPrompts
							local _prompt = prompt
							table.insert(_activatableProximityPrompts, _prompt)
							self:ShowPrompt(prompt)
						end
					else
						local promptIndex = self:GetActivePromptIndexById(prompt.id)
						local wasActive = promptIndex > -1
						-- If prompt was active, but is now out of range, hide prompt.
						if wasActive then
							local _activatableKeycodes = self.activatableKeycodes
							local _activationKey = prompt.data.activationKey
							_activatableKeycodes[_activationKey] = nil
							table.remove(self.activatableProximityPrompts, promptIndex + 1)
							self:HidePrompt(prompt)
						end
					end
				end
				for _k, _v in _proximityPrompts do
					_arg0(_v, _k - 1, _proximityPrompts)
				end
			end)
		end)
	end
	function ProximityPromptController:ShowPrompt(prompt)
		if prompt.promptGameObject then
			prompt.promptGameObject:SetActive(true)
		end
	end
	function ProximityPromptController:HidePrompt(prompt)
		if prompt.promptGameObject then
			prompt.promptGameObject:SetActive(false)
		end
	end
	function ProximityPromptController:GetActivePromptIndexById(promptId)
		local promptIndex = -1
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < #self.activatableProximityPrompts) then
					break
				end
				local promptAtIndex = self.activatableProximityPrompts[i + 1]
				if promptAtIndex.id == promptId then
					promptIndex = i
					break
				end
			end
		end
		return promptIndex
	end
end
-- (Flamework) ProximityPromptController metadata
Reflect.defineMetadata(ProximityPromptController, "identifier", "Bundles/Client/Controllers/Global/ProximityPrompt/ProximityPromptController@ProximityPromptController")
Reflect.defineMetadata(ProximityPromptController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ProximityPromptController, "$:flamework@Controller", Controller, { {} })
return {
	ProximityPromptController = ProximityPromptController,
}
-- ----------------------------------
-- ----------------------------------
