/** Describes the state of a bed. */
export interface BedState {
	/** Team bed belongs to. */
	teamId: string;
	/** Bed position. */
	position: Vector3;
	/** Whether or not bed is destroyed. */
	destroyed: boolean;
}
