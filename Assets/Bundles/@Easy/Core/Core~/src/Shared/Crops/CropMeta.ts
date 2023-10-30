export interface CropStateDto {
	readonly cropIdx: number;
	readonly position: Vector3;
	readonly cropGrowthMaxLevel: number;

	growthIntervalSeconds: number;
	lastGrowthTick: number;
	cropGrowthLevel: number;
}
