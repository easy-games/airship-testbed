/** MoveDirectionMode dictates how move input is applied on the character. */
export const enum MoveDirectionMode {
	/** Move direction is applied in world-space. */
	World,

	/** Move direction is applied relative to the character's direction. */
	Character,

	/** Move direction is applied relative to the camera's direction. */
	Camera,
}
