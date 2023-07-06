-- Compiled with unity-ts v2.1.0-75
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local Mouse = _UserInput.Mouse
local Bin = require("Shared/TS/Util/Bin").Bin
local _CanvasAPI = require("Shared/TS/Util/CanvasAPI")
local CanvasAPI = _CanvasAPI.CanvasAPI
local PointerDirection = _CanvasAPI.PointerDirection
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
-- * Global close key for hiding interfaces.
local CLOSE_KEY = 60
local AppManager
do
	AppManager = setmetatable({}, {
		__tostring = function()
			return "AppManager"
		end,
	})
	AppManager.__index = AppManager
	function AppManager.new(...)
		local self = setmetatable({}, AppManager)
		return self:constructor(...) or self
	end
	function AppManager:constructor()
	end
	function AppManager:Init()
		local backgroundGO = GameObject:Find("AppManagerBackground")
		self.backgroundCanvas = backgroundGO:GetComponent("Canvas")
		local refs = backgroundGO:GetComponent("GameObjectReferences")
		self.backgroundObject = refs:GetValue("UI", "Background")
		CanvasAPI:OnPointerEvent(self.backgroundObject, function(direction, button)
			if direction == PointerDirection.DOWN then
				self:Close()
			end
		end)
	end
	function AppManager:OpenCustom(onClose)
		self:Close({
			noCloseSound = true,
		})
		self.opened = true
		-- Handle mouse locking.
		local lockId = self.mouse:AddUnlocker()
		self.openCanvasBin:Add(function()
			return self.mouse:RemoveUnlocker(lockId)
		end)
		self.openCanvasBin:Add(onClose)
	end
	function AppManager:Open(canvas, config)
		-- Close open `Canvas` if applicable.
		local _fn = self
		local _object = {}
		local _left = "noCloseSound"
		local _result = config
		if _result ~= nil then
			_result = _result.noOpenSound
		end
		local _condition = _result
		if _condition == nil then
			_condition = false
		end
		_object[_left] = _condition
		_fn:Close(_object)
		local _result_1 = config
		if _result_1 ~= nil then
			_result_1 = _result_1.noOpenSound
		end
		if not _result_1 then
			SoundUtil:PlayGlobal("UI_Open.wav")
		end
		--[[
			* Canvas MUST be in Render Mode `RenderMode.ScreenSpaceOverlay`.
			* This enforced on the C# side.
		]]
		-- CanvasUIBridge.InitializeCanvas(canvas, true);
		-- Enable and cache.
		local _result_2 = config
		if _result_2 ~= nil then
			_result_2 = _result_2.noDarkBackground
		end
		if not _result_2 then
			self.backgroundCanvas.enabled = true
		end
		self.openCanvas = canvas
		self.openCanvas.sortingOrder = 11
		self.openCanvas.enabled = true
		self.opened = true
		local _result_3 = config
		if _result_3 ~= nil then
			_result_3 = _result_3.onClose
		end
		if _result_3 ~= nil then
			self.openCanvasBin:Add(config.onClose)
		end
		-- Handle mouse locking.
		local lockId = self.mouse:AddUnlocker()
		self.openCanvasBin:Add(function()
			return self.mouse:RemoveUnlocker(lockId)
		end)
	end
	function AppManager:Close(config)
		if not self.opened then
			return nil
		end
		self.opened = false
		local _result = config
		if _result ~= nil then
			_result = _result.noCloseSound
		end
		if not _result then
			SoundUtil:PlayGlobal("UI_Close.wav")
		end
		if self.openCanvas then
			CanvasUIBridge:HideCanvas(self.openCanvas)
			self.backgroundCanvas.enabled = false
			self.openCanvas = nil
		end
		-- Handle mouse unlocking.
		self.openCanvasBin:Clean()
	end
	function AppManager:IsOpen()
		return self.opened
	end
	AppManager.mouse = Mouse.new()
	AppManager.keyboard = Keyboard.new()
	AppManager.openCanvasBin = Bin.new()
end
-- Listen for close key globally.
AppManager.keyboard.KeyDown:ConnectWithPriority(100, function(event)
	-- TEMP: Compat with legacy app manager.
	if event.Key == CLOSE_KEY and AppManager:IsOpen() then
		event:SetCancelled(true)
		AppManager:Close()
	end
end)
return {
	AppManager = AppManager,
}
-- ----------------------------------
-- ----------------------------------
