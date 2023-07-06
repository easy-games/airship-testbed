-- Compiled with unity-ts v2.1.0-75
local Spring
do
	Spring = setmetatable({}, {
		__tostring = function()
			return "Spring"
		end,
	})
	Spring.__index = Spring
	function Spring.new(...)
		local self = setmetatable({}, Spring)
		return self:constructor(...) or self
	end
	function Spring:constructor(position, angularFrequency)
		self.position = position
		self.angularFrequency = angularFrequency
		self.goal = position
		self.velocity = Vector3.new(0, 0, 0)
	end
	function Spring:update(deltaTime)
		local angFreq = self.angularFrequency * math.pi * 2
		local goal = self.goal
		local p0 = self.position
		local v0 = self.velocity
		local offset = p0 - goal
		local decay = math.exp(-angFreq * deltaTime)
		local _arg0 = 1 + angFreq * deltaTime
		local _exp = offset * _arg0
		local _deltaTime = deltaTime
		local _arg0_1 = v0 * _deltaTime
		local position = (_exp + _arg0_1) * decay + goal
		local _arg0_2 = 1 - angFreq * deltaTime
		local _exp_1 = v0 * _arg0_2
		local _arg0_3 = angFreq * angFreq * deltaTime
		local _arg0_4 = offset * _arg0_3
		self.velocity = (_exp_1 - _arg0_4) * decay
		self.position = position
		return position
	end
	function Spring:resetTo(position)
		self.position = position
		self.goal = position
		self.velocity = Vector3.new(0, 0, 0)
	end
	function Spring:impulse(impulse)
		local _velocity = self.velocity
		local _impulse = impulse
		self.velocity = _velocity + _impulse
	end
end
return {
	Spring = Spring,
}
-- ----------------------------------
-- ----------------------------------
