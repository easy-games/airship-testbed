-- Compiled with unity-ts v2.1.0-75
local _CanvasAPI = require("Shared/TS/Util/CanvasAPI")
local CanvasAPI = _CanvasAPI.CanvasAPI
local HoverState = _CanvasAPI.HoverState
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local BedWarsUI
do
	BedWarsUI = setmetatable({}, {
		__tostring = function()
			return "BedWarsUI"
		end,
	})
	BedWarsUI.__index = BedWarsUI
	function BedWarsUI.new(...)
		local self = setmetatable({}, BedWarsUI)
		return self:constructor(...) or self
	end
	function BedWarsUI:constructor()
	end
	function BedWarsUI:SetupButton(gameObject)
		CanvasAPI:OnClickEvent(gameObject, function()
			SoundUtil:PlayGlobal("UI_Click.wav")
		end)
		CanvasAPI:OnHoverEvent(gameObject, function(hoverState)
			if hoverState == HoverState.ENTER then
				SoundUtil:PlayGlobal("UI_Hover_01.wav")
			end
		end)
	end
end
return {
	BedWarsUI = BedWarsUI,
}
-- ----------------------------------
-- ----------------------------------
