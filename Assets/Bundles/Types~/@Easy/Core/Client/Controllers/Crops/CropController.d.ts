import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { ProximityPromptController } from "../ProximityPrompt/ProximityPromptController";
export declare class CropController implements OnStart {
    private proximityPromptController;
    private cropStates;
    constructor(proximityPromptController: ProximityPromptController);
    private UpdateCropState;
    OnStart(): void;
}
