-- Compiled with unity-ts v2.1.0-75
local function Lerp(from, to, alpha)
	return from + (to - from) * alpha
end
local function MagnitudeV3(v3)
	return math.sqrt(v3.x ^ 2 + v3.y ^ 2 + v3.z ^ 2)
end
local function SqrMagnitudeV3(v3)
	return v3.x ^ 2 + v3.y ^ 2 + v3.z ^ 2
end
local function DistanceV3(from, to)
	local _from = from
	local _to = to
	return MagnitudeV3(_from - _to)
end
local function NormalizeV3(v3)
	local m = MagnitudeV3(v3)
	return Vector3.new(v3.x / m, v3.y / m, v3.z / m)
end
local function DirectionV3(from, to)
	local _to = to
	local _from = from
	return NormalizeV3(_to - _from)
end
local function LerpV3(from, to, alpha)
	return Vector3.new(Lerp(from.x, to.x, alpha), Lerp(from.y, to.y, alpha), Lerp(from.z, to.z, alpha))
end
local function DotV3(a, b)
	return a.x * b.x + a.y * b.y + a.z * b.z
end
local function CrossV3(a, b)
	return Vector3.new(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
end
return {
	MagnitudeV3 = MagnitudeV3,
	SqrMagnitudeV3 = SqrMagnitudeV3,
	DistanceV3 = DistanceV3,
	NormalizeV3 = NormalizeV3,
	DirectionV3 = DirectionV3,
	LerpV3 = LerpV3,
	DotV3 = DotV3,
	CrossV3 = CrossV3,
}
-- ----------------------------------
-- ----------------------------------
