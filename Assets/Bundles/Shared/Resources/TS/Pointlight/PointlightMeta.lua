-- Compiled with unity-ts v2.1.0-75
-- * Pointlight DTO.
-- * Converts a `SavePointlight` to a `PointlightDTO`.
local function SavePointlightToDto(pointlight)
	return {
		color = { pointlight.color.r, pointlight.color.g, pointlight.color.b, pointlight.color.a },
		position = pointlight.position,
		rotation = pointlight.rotation,
		range = pointlight.range,
		intensity = pointlight.intensity,
		castShadows = pointlight.castShadows,
		highQualityLight = pointlight.highQualityLight,
	}
end
return {
	SavePointlightToDto = SavePointlightToDto,
}
-- ----------------------------------
-- ----------------------------------
