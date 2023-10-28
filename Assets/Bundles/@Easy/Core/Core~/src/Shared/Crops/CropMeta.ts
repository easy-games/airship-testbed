export interface CropStateDto {
	readonly position: Vector3;
	readonly cropGrowthMaxLevel: number;

	growthIntervalSeconds: number;
	lastGrowthTick: number;
	cropGrowthLevel: number;
}
