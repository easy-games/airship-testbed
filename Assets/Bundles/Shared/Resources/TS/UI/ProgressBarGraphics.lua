-- Compiled with unity-ts v2.1.0-75
local Task = require("Shared/TS/Util/Task").Task
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local ProgressBarGraphics
do
	ProgressBarGraphics = setmetatable({}, {
		__tostring = function()
			return "ProgressBarGraphics"
		end,
	})
	ProgressBarGraphics.__index = ProgressBarGraphics
	function ProgressBarGraphics.new(...)
		local self = setmetatable({}, ProgressBarGraphics)
		return self:constructor(...) or self
	end
	function ProgressBarGraphics:constructor(transform, options)
		self.TransformKey = "Transforms"
		self.GraphicsKey = "Graphics"
		self.AnimKey = "Animations"
		self.fillDurationInSeconds = 0.08
		self.changeDelayInSeconds = 0.3
		self.changeDurationInSeconds = 0.125
		self.enabled = true
		self.deathOnZero = true
		self.currentDelta = 0
		self.transform = transform.gameObject:GetComponent("RectTransform")
		self.refs = transform:GetComponent("GameObjectReferences")
		self.fillImage = self.refs:GetValue(self.GraphicsKey, "Fill")
		self.fillTransform = self.refs:GetValue(self.TransformKey, "Fill")
		self.changeFillTransform = self.refs:GetValue(self.TransformKey, "ChangeFill")
		self.growthFillTransform = self.refs:GetValue(self.TransformKey, "GrowthFill")
		self.graphicsHolder = self.refs:GetValue(self.TransformKey, "GraphicsHolder")
		self.brokenGraphicsHolder = self.refs:GetValue(self.TransformKey, "BrokenGraphicsHolder")
		self.deathAnim = self.refs:GetValue(self.AnimKey, "Finished")
		self.graphicsHolder.gameObject:SetActive(true)
		self.brokenGraphicsHolder.gameObject:SetActive(false)
		local _result = options
		if _result ~= nil then
			_result = _result.deathOnZero
		end
		local _condition = _result
		if _condition == nil then
			_condition = true
		end
		self.deathOnZero = _condition
		local _result_1 = options
		if _result_1 ~= nil then
			_result_1 = _result_1.fillColor
		end
		if _result_1 then
			self:SetColor(options.fillColor)
		end
		local _fn = self
		local _result_2 = options
		if _result_2 ~= nil then
			_result_2 = _result_2.initialPercentDelta
		end
		local _condition_1 = _result_2
		if _condition_1 == nil then
			_condition_1 = 1
		end
		_fn:InstantlySetValue(_condition_1)
		self.enabled = true
	end
	function ProgressBarGraphics:OnDelete()
		self.fillTransform:TweenCancelAll(false, true)
		self.changeFillTransform:TweenCancelAll(false, true)
		self.enabled = false
		GameObjectBridge:Destroy(self.transform.gameObject)
	end
	function ProgressBarGraphics:SetColor(newColor)
		self.fillImage.color = newColor
	end
	function ProgressBarGraphics:InstantlySetValue(percentDelta)
		self.currentDelta = percentDelta
		local fillScale = Vector3.new(percentDelta, self.fillTransform.localScale.y, self.fillTransform.localScale.z)
		self.fillTransform.localScale = fillScale
		self.changeFillTransform.localScale = fillScale
	end
	function ProgressBarGraphics:SetValue(percentDelta)
		if self.deathOnZero and percentDelta <= 0 then
			-- Wait for the change animation
			Task:Delay(self.fillDurationInSeconds, function()
				if self.transform then
					-- Play the death animation
					self.deathAnim:Play()
					self.graphicsHolder.gameObject:SetActive(false)
					self.brokenGraphicsHolder.gameObject:SetActive(true)
					Task:Delay(1.1, function()
						if self.transform and self.currentDelta > 0 then
							-- Reset if the progress has filled back up (Respawn)
							self:SetValue(self.currentDelta)
						end
					end)
				end
			end)
		else
			self.deathAnim:Stop()
			self.graphicsHolder.gameObject:SetActive(true)
			self.brokenGraphicsHolder.gameObject:SetActive(false)
		end
		-- Animate fill down
		self.fillTransform:TweenLocalScaleX(percentDelta, self.fillDurationInSeconds)
		if percentDelta > self.currentDelta then
			-- Growth
			self.changeFillTransform.gameObject:SetActive(false)
			self.growthFillTransform.gameObject:SetActive(true)
			self.growthFillTransform.localScale = Vector3.new(percentDelta - self.currentDelta, self.growthFillTransform.localScale.y, self.growthFillTransform.localScale.z)
			self.growthFillTransform.anchoredPosition = Bridge:MakeVector2(self.transform.rect.width * self.currentDelta, self.growthFillTransform.anchoredPosition.y)
			self.growthFillTransform:TweenLocalScaleX(0, self.fillDurationInSeconds)
			self.growthFillTransform:TweenAnchoredPositionX(self.transform.rect.width * percentDelta, self.changeDurationInSeconds)
		else
			-- Decay
			self.growthFillTransform.gameObject:SetActive(false)
			self.changeFillTransform.gameObject:SetActive(true)
			-- Hold then animate change indicator
			Task:Delay(self.changeDelayInSeconds, function()
				if not self.enabled then
					return nil
				end
				self.changeFillTransform:TweenLocalScaleX(percentDelta, self.changeDurationInSeconds)
			end)
		end
		self.currentDelta = percentDelta
	end
end
return {
	ProgressBarGraphics = ProgressBarGraphics,
}
-- ----------------------------------
-- ----------------------------------
