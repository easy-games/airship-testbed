import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
export declare const enum CoreCropBlockMetaKeys {
    CROP_GROWTH_LEVEL = "cropGrowthLevel",
    CROP_HARVESTABLE = "cropHarvestable"
}
export declare class CropGrowthService implements OnStart {
    private cropCounter;
    private cropStates;
    OnStart(): void;
}
