/**
 * Fixed camera configuration. Describes the behaviour and appearance of camera.
 */
export interface FixedCameraConfig {
	/**
	 * The camera's `x` offset relative to the target.
	 */
	xOffset?: number;
	/**
	 * The camera's `y` offset relative to the target.
	 */
	yOffset?: number;
	/**
	 * The camera's `z` offset relative to the target.
	 */
	zOffset?: number;
	/**
	 * The camera's minimum `x` rotation angle in **degrees**. This is how far **down** the camera can look.
	 */
	minRotX?: number;
	/**
	 * The camera's maximum `x` rotation angle in **degrees**. This is how far **up** the camera can look.
	 */
	maxRotX?: number;
	/**
	 * Whether or not occlusion bumping should be performed. Occlusion bumping prevents the camera's transform
	 * from being positioned inside of objects.
	 */
	shouldOcclusionBump: boolean;
}

/**
 * Fixed camera configuration. Describes the behaviour and appearance of camera.
 */
interface FirstPersonCrouchConfig {
	/**
	 * Camera animation speed when entering crouch.
	 */
	speed: number;
	/**
	 * Camera target `y` offset while crouching.
	 */
	yOffset: number;
}

export class CameraConstants {
	/**
	 * Default fixed camera configuration. This configuration is optimized for use with the default
	 * Airship character in third person mode.
	 */
	public static DefaultFixedCameraConfig: Required<FixedCameraConfig> = {
		xOffset: 0.45,
		yOffset: 1.7,
		zOffset: 3.5,
		minRotX: 1,
		maxRotX: 179,
		shouldOcclusionBump: true,
	};

	/**
	 * Default first person fixed camera configuration. This configuration is optimized for use with the default
	 * Airship character.
	 */
	public static DefaultFirstPersonFixedCameraConfig: Partial<FixedCameraConfig> & { staticOffset: Vector3 } = {
		xOffset: 0,
		zOffset: 1,
		shouldOcclusionBump: false,
		// An additional positional offset applied to camera to place it at character eye level.
		staticOffset: new Vector3(0, -0.13, 0),
	};

	/**
	 * Default first person crouch configuration. This configuration is optimized for use with the default
	 * Airship character.
	 */
	public static FirstPersonCrouchConfig: FirstPersonCrouchConfig = {
		speed: 5,
		yOffset: 1.13,
	};
}
