-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local BedWarsUI = require("Shared/TS/UI/BedWarsUI").BedWarsUI
local Keyboard = require("Shared/TS/UserInput/init").Keyboard
local AppManager = require("Shared/TS/Util/AppManager").AppManager
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local Task = require("Shared/TS/Util/Task").Task
local EscapeMenuController
do
	EscapeMenuController = setmetatable({}, {
		__tostring = function()
			return "EscapeMenuController"
		end,
	})
	EscapeMenuController.__index = EscapeMenuController
	function EscapeMenuController.new(...)
		local self = setmetatable({}, EscapeMenuController)
		return self:constructor(...) or self
	end
	function EscapeMenuController:constructor()
		self.closing = false
		local go = GameObject:Find("CoreUI/EscapeMenu")
		self.canvas = go:GetComponent("Canvas")
		self.canvas.enabled = false
		self.canvasGroup = go:GetComponent("CanvasGroup")
		self.refs = go:GetComponent("GameObjectReferences")
		self.wrapperRect = self.refs:GetValue("UI", "Wrapper"):GetComponent("RectTransform")
		local closeButton = self.refs:GetValue("UI", "CloseButton")
		BedWarsUI:SetupButton(closeButton)
		CanvasAPI:OnClickEvent(closeButton, function()
			AppManager:Close({
				noCloseSound = true,
			})
		end)
	end
	function EscapeMenuController:OnStart()
		local keyboard = Keyboard.new()
		keyboard.KeyDown:ConnectWithPriority(300, function(event)
			if event.Key == 60 then
				self:Open()
			end
		end)
		local leaveButton = self.refs:GetValue("UI", "LeaveButton")
		BedWarsUI:SetupButton(leaveButton)
		CanvasAPI:OnClickEvent(leaveButton, function()
			self:Disconnect()
		end)
	end
	function EscapeMenuController:Open()
		if AppManager:IsOpen() then
			return nil
		end
		if self.closing then
			return nil
		end
		local duration = 0.08
		self.wrapperRect.localScale = Vector3.new(1.1, 1.1, 1.1)
		self.wrapperRect:TweenLocalScale(Vector3.new(1, 1, 1), duration)
		self.canvasGroup.alpha = 0
		self.canvasGroup:TweenCanvasGroupAlpha(1, duration)
		self.canvas.enabled = true
		AppManager:OpenCustom(function()
			self.closing = true
			self.canvasGroup:TweenCanvasGroupAlpha(0, duration)
			Task:Delay(duration, function()
				self.canvas.enabled = false
				self.closing = false
			end)
		end)
	end
	function EscapeMenuController:Disconnect()
		local clientNetworkConnector = GameObject:Find("Network"):GetComponent("ClientNetworkConnector")
		clientNetworkConnector:Disconnect()
		SceneManager:LoadScene("MainMenu", 0)
	end
end
-- (Flamework) EscapeMenuController metadata
Reflect.defineMetadata(EscapeMenuController, "identifier", "Bundles/Client/Controllers/Global/Core/EscapeMenu/EscapeMenuController@EscapeMenuController")
Reflect.defineMetadata(EscapeMenuController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(EscapeMenuController, "$:flamework@Controller", Controller, { {} })
return {
	EscapeMenuController = EscapeMenuController,
}
-- ----------------------------------
-- ----------------------------------
