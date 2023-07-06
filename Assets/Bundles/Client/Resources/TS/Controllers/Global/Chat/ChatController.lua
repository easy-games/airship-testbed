-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local Network = require("Shared/TS/Network").Network
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local Mouse = _UserInput.Mouse
local Bin = require("Shared/TS/Util/Bin").Bin
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local ChatController
do
	ChatController = setmetatable({}, {
		__tostring = function()
			return "ChatController"
		end,
	})
	ChatController.__index = ChatController
	function ChatController.new(...)
		local self = setmetatable({}, ChatController)
		return self:constructor(...) or self
	end
	function ChatController:constructor(localEntityController)
		self.localEntityController = localEntityController
		self.selected = false
		self.selectedBin = Bin.new()
		local refs = GameObject:Find("Chat"):GetComponent("GameObjectReferences")
		self.content = refs:GetValue("UI", "Content")
		self.chatMessagePrefab = refs:GetValue("UI", "ChatMessagePrefab")
		self.inputField = refs:GetValue("UI", "InputField")
		self.content.gameObject:ClearChildren()
	end
	function ChatController:OnStart()
		Network.ServerToClient.ChatMessage.Client:OnServerEvent(function(text)
			self:AddChatMessage(text)
		end)
		local keyboard = Keyboard.new()
		keyboard.KeyDown:ConnectWithPriority(100, function(event)
			if self.selected then
				if event.Key == 2 then
					if self.inputField.text == "" then
						EventSystem.current:ClearSelected()
						return nil
					end
					self:SubmitInputField()
					return nil
				elseif event.Key == 60 then
					EventSystem.current:ClearSelected()
					self.inputField:SetTextWithoutNotify("")
					event:SetCancelled(true)
					return nil
				end
				-- cancel input when using input field
				event:SetCancelled(true)
			elseif event.Key == 2 then
				self.inputField:Select()
			elseif event.Key == 9 then
				self.inputField:SetTextWithoutNotify("/")
				self.inputField.caretPosition = 1
				self.inputField:Select()
			end
		end)
		local mouse = Mouse.new()
		CanvasAPI:OnSelectEvent(self.inputField.gameObject, function()
			self.selected = true
			local _entityInputDisabler = self.localEntityController:GetEntityInput()
			if _entityInputDisabler ~= nil then
				_entityInputDisabler = _entityInputDisabler:AddDisabler()
			end
			local entityInputDisabler = _entityInputDisabler
			if entityInputDisabler ~= nil then
				self.selectedBin:Add(entityInputDisabler)
			end
			local mouseLocker = mouse:AddUnlocker()
			self.selectedBin:Add(function()
				mouse:RemoveUnlocker(mouseLocker)
			end)
		end)
		CanvasAPI:OnDeselectEvent(self.inputField.gameObject, function()
			self.selectedBin:Clean()
			self.selected = false
		end)
	end
	function ChatController:SubmitInputField()
		local text = self.inputField.text
		self:SendChatMessage(text)
		self.inputField:SetTextWithoutNotify("")
		EventSystem.current:ClearSelected()
	end
	function ChatController:SendChatMessage(message)
		Network.ClientToServer.SendChatMessage.Client:FireServer(message)
	end
	function ChatController:AddChatMessage(message)
		TS.try(function()
			local chatMessage = GameObjectBridge:InstantiateIn(self.chatMessagePrefab, self.content.transform)
			local refs = chatMessage:GetComponent("GameObjectReferences")
			local textGui = refs:GetValue("UI", "Text")
			textGui.text = message
		end, function(err)
			print("chat error.")
			print(err)
		end)
	end
	function ChatController:IsChatFocused()
		return self.selected
	end
end
-- (Flamework) ChatController metadata
Reflect.defineMetadata(ChatController, "identifier", "Bundles/Client/Controllers/Global/Chat/ChatController@ChatController")
Reflect.defineMetadata(ChatController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController" })
Reflect.defineMetadata(ChatController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ChatController, "$:flamework@Controller", Controller, { {} })
return {
	ChatController = ChatController,
}
-- ----------------------------------
-- ----------------------------------
