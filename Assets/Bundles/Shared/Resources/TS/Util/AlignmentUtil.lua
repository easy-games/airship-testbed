-- Compiled with unity-ts v2.1.0-75
local AlignmentUtil
do
	AlignmentUtil = setmetatable({}, {
		__tostring = function()
			return "AlignmentUtil"
		end,
	})
	AlignmentUtil.__index = AlignmentUtil
	function AlignmentUtil.new(...)
		local self = setmetatable({}, AlignmentUtil)
		return self:constructor(...) or self
	end
	function AlignmentUtil:constructor()
	end
	function AlignmentUtil:GetWorldRotationForLookingAt(sourceTransform, forward, up, worldForward, worldUp)
		-- print(`GetWorldRotationForLookingAt() sourceTransform is null?: ${sourceTransform === undefined}`);
		-- print(`GetWorldRotationForLookingAt() sourceTransform.name: ${sourceTransform.name}`);
		-- Find the world rotation which we want to be facing.
		local finalRotation = Quaternion.identity
		local success, err = pcall(function()
			local desiredWorldRotation = Quaternion.LookRotation(worldForward)
			-- print(`GetWorldRotationForLookingAt() desiredWorldRotation: ${desiredWorldRotation}`);
			local knownWorldForward = self:GetWorldVectorFromVectorType(sourceTransform, forward)
			-- print(`GetWorldRotationForLookingAt() knownWorldForward: ${knownWorldForward}`);
			local knownWorldUp = self:GetWorldVectorFromVectorType(sourceTransform, up)
			-- print(`GetWorldRotationForLookingAt() knownWorldUp: ${knownWorldUp}`);
			local knownRotation = Quaternion.LookRotation(knownWorldForward, knownWorldUp)
			-- print(`GetWorldRotationForLookingAt() knownRotation: ${knownRotation}`);
			local inverse = AlignmentManager.Instance:InverseQuat(knownRotation)
			-- print(`GetWorldRotationForLookingAt() 1`);
			local typeOfInv = typeof(inverse)
			-- print(`GetWorldRotationForLookingAt() 2`);
			-- print(`GetWorldRotationForLookingAt() typeOfInv: ${typeOfInv}`);
			-- Find desired rotation relative to source transform.
			local _rotation = sourceTransform.rotation
			local rotationAdjustment = inverse * _rotation
			-- const rotationAdjustment = Quat_Quat_Mult(Quaternion.Inverse(knownRotation), sourceTransform.rotation);
			-- print(`GetWorldRotationForLookingAt() rotationAdjustment: ${rotationAdjustment}`);
			-- Applied our rotation adjustment to the desired world rotation
			-- to make the proper side of the object face that direction.
			finalRotation = desiredWorldRotation * rotationAdjustment
			-- finalRotation = Quat_Quat_Mult(desiredWorldRotation, rotationAdjustment);
			-- print(`GetWorldRotationForLookingAt() finalRotation: ${finalRotation}`);
		end)
		if not success then
			print("GetWorldRotationForLookingAt() error: " .. tostring(err))
		end
		return finalRotation
	end
	function AlignmentUtil:GetWorldVectorFromVectorType(sourceTransform, knownVectorType)
		-- print(`GetWorldVectorFromVectorType() sourceTransform.name: ${sourceTransform.name}, knownVectorType: ${knownVectorType}`);
		local worldVector = self.forward
		repeat
			if knownVectorType == 0 then
				worldVector = sourceTransform.forward
				break
			end
			if knownVectorType == 1 then
				worldVector = sourceTransform.forward * (-1)
				break
			end
			if knownVectorType == 2 then
				worldVector = sourceTransform.right
				break
			end
			if knownVectorType == 3 then
				worldVector = sourceTransform.right * (-1)
				break
			end
			if knownVectorType == 4 then
				worldVector = sourceTransform.up
				break
			end
			if knownVectorType == 5 then
				worldVector = sourceTransform.up * (-1)
				break
			end
			if knownVectorType == 6 then
				worldVector = self.forward
				break
			end
			if knownVectorType == 7 then
				worldVector = self.back
				break
			end
			if knownVectorType == 8 then
				worldVector = self.right
				break
			end
			if knownVectorType == 9 then
				worldVector = self.left
				break
			end
			if knownVectorType == 10 then
				worldVector = self.up
				break
			end
			if knownVectorType == 11 then
				worldVector = self.down
				break
			end
			print("Unsupported KnownVectorType encountered: " .. tostring(knownVectorType))
			worldVector = self.forward
			break
		until true
		return worldVector
	end
	AlignmentUtil.up = Vector3.new(0, 1, 0)
	AlignmentUtil.down = Vector3.new(0, -1, 0)
	AlignmentUtil.right = Vector3.new(1, 0, 0)
	AlignmentUtil.left = Vector3.new(-1, 0, 0)
	AlignmentUtil.forward = Vector3.new(0, 0, 1)
	AlignmentUtil.back = Vector3.new(0, 0, -1)
end
return {
	AlignmentUtil = AlignmentUtil,
}
-- ----------------------------------
-- ----------------------------------
