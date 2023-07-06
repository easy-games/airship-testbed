/** Pointlight DTO. */
export interface PointlightDto {
	/** Pointlight color. Unwrapped `Color` struct. */
	color: [r: number, g: number, b: number, a: number];
	/** Pointlight position. */
	position: Vector3;
	/** Pointlight rotation. */
	rotation: Quaternion;
	/** Pointlight range. */
	range: number;
	/** Pointlight intensity. */
	intensity: number;
	/** Whether or not pointlight casts shadows. */
	castShadows: boolean;
	/** Whether or not pointlight is a high quality light. */
	highQualityLight: boolean;
}

/** Converts a `SavePointlight` to a `PointlightDTO`. */
export function SavePointlightToDto(pointlight: SavePointlight): PointlightDto {
	return {
		color: [pointlight.color.r, pointlight.color.g, pointlight.color.b, pointlight.color.a],
		position: pointlight.position,
		rotation: pointlight.rotation,
		range: pointlight.range,
		intensity: pointlight.intensity,
		castShadows: pointlight.castShadows,
		highQualityLight: pointlight.highQualityLight,
	};
}
