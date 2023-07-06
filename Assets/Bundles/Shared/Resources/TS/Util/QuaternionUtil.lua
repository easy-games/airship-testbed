-- Compiled with unity-ts v2.1.0-75
-- export function QuaternionLookRotation(forward: Vector3, up: Vector3) : Quaternion {
-- forward = forward.Normalize();
-- const vector2 = NormalizeV3(CrossV3(up, forward));
-- const vector3 = CrossV3(forward, vector2);
-- const m00 = vector2.x;
-- const m01 = vector2.y;
-- const m02 = vector2.z;
-- const m10 = vector3.x;
-- const m11 = vector3.y;
-- const m12 = vector3.z;
-- const m20 = forward.x;
-- const m21 = forward.y;
-- const m22 = forward.z;
-- const quaternion = Quaternion.identity;
-- const num8 = (m00 + m11) + m22;
-- if (num8 > 0)
-- {
-- let num = math.sqrt(num8 + 1);
-- quaternion.w = num * 0.5;
-- num = 0.5 / num;
-- quaternion.x = (m12 - m21) * num;
-- quaternion.y = (m20 - m02) * num;
-- quaternion.z = (m01 - m10) * num;
-- return quaternion;
-- }
-- if ((m00 >= m11) && (m00 >= m22))
-- {
-- const num7 = math.sqrt(((1 + m00) - m11) - m22);
-- const num4 = 0.5 / num7;
-- quaternion.x = 0.5 * num7;
-- quaternion.y = (m01 + m10) * num4;
-- quaternion.z = (m02 + m20) * num4;
-- quaternion.w = (m12 - m21) * num4;
-- return quaternion;
-- }
-- if (m11 > m22)
-- {
-- const num6 = math.sqrt(((1 + m11) - m00) - m22);
-- const num3 = 0.5 / num6;
-- quaternion.x = (m10+ m01) * num3;
-- quaternion.y = 0.5 * num6;
-- quaternion.z = (m21 + m12) * num3;
-- quaternion.w = (m20 - m02) * num3;
-- return quaternion;
-- }
-- const num5 = math.sqrt(((1 + m22) - m00) - m11);
-- const num2 = 0.5 / num5;
-- quaternion.x = (m20 + m02) * num2;
-- quaternion.y = (m21 + m12) * num2;
-- quaternion.z = 0.5 * num5;
-- quaternion.w = (m01 - m10) * num2;
-- return quaternion;
-- }
-- export function Quat_Quat_Mult(lhs: Quaternion, rhs: Quaternion): Quaternion {
-- const quaternion = Quaternion.identity;
-- quaternion.x = lhs.w * rhs.x + lhs.x * rhs.w + lhs.y * rhs.z - lhs.z * rhs.y;
-- quaternion.y = lhs.w * rhs.y + lhs.y * rhs.w + lhs.z * rhs.x - lhs.x * rhs.z;
-- quaternion.z = lhs.w * rhs.z + lhs.z * rhs.w + lhs.x * rhs.y - lhs.y * rhs.x;
-- quaternion.w = lhs.w * rhs.w - lhs.x * rhs.x - lhs.y * rhs.y - lhs.z * rhs.z;
-- return quaternion;
-- }
local function Quat_Vec_Mult(quaternion, point)
	local x = quaternion.x * 2
	local y = quaternion.y * 2
	local z = quaternion.z * 2
	local xx = quaternion.x * x
	local yy = quaternion.y * y
	local zz = quaternion.z * z
	local xy = quaternion.x * y
	local xz = quaternion.x * z
	local yz = quaternion.y * z
	local wx = quaternion.w * x
	local wy = quaternion.w * y
	local wz = quaternion.w * z
	return Vector3.new((1 - (yy + zz)) * point.x + (xy - wz) * point.y + (xz + wy) * point.z, (xy + wz) * point.x + (1 - (xx + zz)) * point.y + (yz - wx) * point.z, (xz - wy) * point.x + (yz + wx) * point.y + (1 - (xx + yy)) * point.z)
end
return {
	Quat_Vec_Mult = Quat_Vec_Mult,
}
-- ----------------------------------
-- ----------------------------------
