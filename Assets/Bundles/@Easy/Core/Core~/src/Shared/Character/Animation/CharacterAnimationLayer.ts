export enum CharacterAnimationLayer {
	/** Lowest priority, used for Airship Core animations */
	CORE = 0,
	/** Recommended layer for idle animations  */
	LAYER_1 = 1,
	/** Recommended layer for movement animations  */
	LAYER_2 = 2,
	/** Recommended layer for low-priority actions */
	LAYER_3 = 3,
	/** Highest priority, recommended for high-priority actions */
	LAYER_4 = 4,
}
