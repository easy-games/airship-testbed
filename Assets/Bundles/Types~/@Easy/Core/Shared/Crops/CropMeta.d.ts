/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
export interface CropStateDto {
    readonly cropIdx: number;
    readonly position: Vector3;
    readonly cropGrowthMaxLevel: number;
    growthIntervalSeconds: number;
    lastGrowthTick: number;
    cropGrowthLevel: number;
}
