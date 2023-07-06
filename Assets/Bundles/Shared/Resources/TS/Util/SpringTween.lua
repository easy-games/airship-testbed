-- Compiled with unity-ts v2.1.0-75
local Spring = require("Shared/TS/Util/Spring").Spring
local EPSILON = 0.0001
local SpringTween
do
	SpringTween = setmetatable({}, {
		__tostring = function()
			return "SpringTween"
		end,
	})
	SpringTween.__index = SpringTween
	function SpringTween.new(...)
		local self = setmetatable({}, SpringTween)
		return self:constructor(...) or self
	end
	function SpringTween:constructor(position, angularFrequency, minDuration)
		self.minDuration = minDuration
		self.elapsedTime = 0
		self.spring = Spring.new(position, angularFrequency)
	end
	function SpringTween:setGoal(goal)
		self.elapsedTime = 0
		self.spring.goal = goal
	end
	function SpringTween:impulse(impulse)
		self.elapsedTime = 0
		self.spring:impulse(impulse)
	end
	function SpringTween:resetTo(position)
		self.elapsedTime = 0
		self.spring:resetTo(position)
	end
	function SpringTween:update(deltaTime)
		self.elapsedTime += deltaTime
		local springPos = self.spring:update(deltaTime)
		return springPos, self.elapsedTime >= self.minDuration and self.spring.velocity.magnitude < EPSILON
	end
end
return {
	SpringTween = SpringTween,
}
-- ----------------------------------
-- ----------------------------------
