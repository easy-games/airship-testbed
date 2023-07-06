-- Compiled with unity-ts v2.1.0-75
local MathUtil
do
	MathUtil = setmetatable({}, {
		__tostring = function()
			return "MathUtil"
		end,
	})
	MathUtil.__index = MathUtil
	function MathUtil.new(...)
		local self = setmetatable({}, MathUtil)
		return self:constructor(...) or self
	end
	function MathUtil:constructor()
	end
	function MathUtil:RandomSign()
		return if math.random() > 0.5 then 1 else -1
	end
	function MathUtil:Lerp(a, b, t)
		return a + (b - a) * t
	end
	function MathUtil:Map(n, oldMin, oldMax, min, max)
		return min + (max - min) * ((n - oldMin) / (oldMax - oldMin))
	end
	function MathUtil:FloorVec(vec)
		return Vector3.new(math.floor(vec.x), math.floor(vec.y), math.floor(vec.z))
	end
	function MathUtil:RoundVec(vec)
		return Vector3.new(math.round(vec.x), math.round(vec.y), math.round(vec.z))
	end
	function MathUtil:InvLerp(a, b, v)
		return (v - a) / (b - a)
	end
	function MathUtil:Clamp(value, min, max)
		if min == nil then
			min = 0
		end
		if max == nil then
			max = 1
		end
		if value <= min then
			return min
		end
		if value >= max then
			return max
		end
		return value
	end
	function MathUtil:ClampAngle(angle, min, max)
		angle = angle % 360
		min = min % 360
		max = max % 360
		local inverse = false
		local tmin = min
		local tangle = angle
		if min > 180 then
			inverse = not inverse
			tmin -= 180
		end
		if angle > 180 then
			inverse = not inverse
			tangle -= 180
		end
		local result = if not inverse then tangle > tmin else tangle < tmin
		if not result then
			angle = min
		end
		inverse = false
		tangle = angle
		local tmax = max
		if angle > 180 then
			inverse = not inverse
			tangle -= 180
		end
		if max > 180 then
			inverse = not inverse
			tmax -= 180
		end
		result = if not inverse then tangle < tmax else tangle > tmax
		if not result then
			angle = max
		end
		return angle
	end
	function MathUtil:Inverse(value)
		-- -1   (       a              -v       )
		-- q   = ( -------------   ------------- )
		-- (  a^2 + |v|^2  ,  a^2 + |v|^2  )
		local ls = value.x * value.x + value.y * value.y + value.z * value.z + value.w * value.w
		local invNorm = 1.0 / ls
		return Quaternion.new(-value.x * invNorm, -value.y * invNorm, -value.z * invNorm, value.w * invNorm)
	end
end
return {
	MathUtil = MathUtil,
}
-- ----------------------------------
-- ----------------------------------
