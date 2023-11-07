import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
export declare class DamageIndicatorController implements OnStart {
    private damageIndicatorObject;
    hitMarkerImage: Image;
    private hitMarkerBin;
    hitMarkerAudioClip: AudioClip | undefined;
    constructor();
    OnStart(): void;
}
