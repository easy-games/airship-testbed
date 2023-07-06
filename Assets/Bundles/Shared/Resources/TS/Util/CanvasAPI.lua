-- Compiled with unity-ts v2.1.0-75
-- * Pointer button.
local PointerButton
do
	local _inverse = {}
	PointerButton = setmetatable({}, {
		__index = _inverse,
	})
	PointerButton.LEFT = 0
	_inverse[0] = "LEFT"
	PointerButton.RIGHT = 1
	_inverse[1] = "RIGHT"
	PointerButton.MIDDLE = 2
	_inverse[2] = "MIDDLE"
end
-- * Pointer direction.
local PointerDirection
do
	local _inverse = {}
	PointerDirection = setmetatable({}, {
		__index = _inverse,
	})
	PointerDirection.DOWN = 0
	_inverse[0] = "DOWN"
	PointerDirection.UP = 1
	_inverse[1] = "UP"
end
-- * Hover state.
local HoverState
do
	local _inverse = {}
	HoverState = setmetatable({}, {
		__index = _inverse,
	})
	HoverState.ENTER = 0
	_inverse[0] = "ENTER"
	HoverState.EXIT = 1
	_inverse[1] = "EXIT"
end
local CanvasAPI
do
	CanvasAPI = setmetatable({}, {
		__tostring = function()
			return "CanvasAPI"
		end,
	})
	CanvasAPI.__index = CanvasAPI
	function CanvasAPI.new(...)
		local self = setmetatable({}, CanvasAPI)
		return self:constructor(...) or self
	end
	function CanvasAPI:constructor()
	end
	function CanvasAPI:Init()
		self.canvasUIEvents = GameObject:Find("CanvasUIEvents"):GetComponent("CanvasUIEvents")
		self.canvasHitDetector = self.canvasUIEvents.gameObject:GetComponent("CanvasHitDetector")
	end
	function CanvasAPI:RegisterEvents(gameObject)
		self.canvasUIEvents:RegisterEvents(gameObject)
	end
	function CanvasAPI:IsPointerOverUI()
		return self.canvasHitDetector:IsPointerOverUI()
	end
	function CanvasAPI:OnPointerEvent(targetGameObject, callback)
		self:Setup(targetGameObject)
		self.eventInterceptor:OnPointerEvent(function(instanceId, direction, button)
			-- Only run callback if instance ids match.
			if instanceId == targetGameObject:GetInstanceID() then
				callback(direction, button)
			end
		end)
	end
	function CanvasAPI:OnHoverEvent(targetGameObject, callback)
		self:Setup(targetGameObject)
		self.eventInterceptor:OnHoverEvent(function(instanceId, hoverState)
			-- Only run callback if instance ids match.
			if instanceId == targetGameObject:GetInstanceID() then
				callback(hoverState)
			end
		end)
	end
	function CanvasAPI:OnSubmitEvent(targetGameObject, callback)
		self:Setup(targetGameObject)
		self.eventInterceptor:OnSubmitEvent(function(instanceId)
			-- Only run callback if instance ids match.
			if instanceId == targetGameObject:GetInstanceID() then
				callback()
			end
		end)
	end
	function CanvasAPI:OnSelectEvent(targetGameObject, callback)
		self:Setup(targetGameObject)
		self.eventInterceptor:OnSelectEvent(function(instanceId)
			-- Only run callback if instance ids match.
			if instanceId == targetGameObject:GetInstanceID() then
				callback()
			end
		end)
	end
	function CanvasAPI:OnDeselectEvent(targetGameObject, callback)
		self:Setup(targetGameObject)
		self.eventInterceptor:OnDeselectEvent(function(instanceId)
			-- Only run callback if instance ids match.
			if instanceId == targetGameObject:GetInstanceID() then
				callback()
			end
		end)
	end
	function CanvasAPI:OnClickEvent(targetGameObject, callback)
		self:Setup(targetGameObject)
		self.eventInterceptor:OnClickEvent(function(instanceId)
			-- Only run callback if instance ids match.
			if instanceId == targetGameObject:GetInstanceID() then
				callback()
			end
		end)
	end
	function CanvasAPI:OnValueChangeEvent(targetGameObject, callback)
		self:Setup(targetGameObject)
		self.eventInterceptor:OnValueChangeEvent(function(instanceId, value)
			if instanceId == targetGameObject:GetInstanceID() then
				callback(value)
			end
		end)
	end
	function CanvasAPI:Setup(gameObject)
		if CanvasAPI.eventInterceptor == nil then
			self.eventInterceptor = GameObject:Find("CanvasUIEventsInterceptor"):GetComponent("CanvasUIEventInterceptor")
		end
		self:RegisterEvents(gameObject)
	end
end
return {
	PointerButton = PointerButton,
	PointerDirection = PointerDirection,
	HoverState = HoverState,
	CanvasAPI = CanvasAPI,
}
-- ----------------------------------
-- ----------------------------------
