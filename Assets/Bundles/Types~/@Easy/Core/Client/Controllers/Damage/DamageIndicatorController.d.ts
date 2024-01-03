import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { DamageType } from "../../../Shared/Damage/DamageType";
export declare class DamageIndicatorController implements OnStart {
    private combatEffectsCanvas;
    hitMarkerImage: Image;
    private hitMarkerBin;
    hitMarkerAudioClip: AudioClip | undefined;
    criticalHitAudioClips: AudioClip[];
    private indicatorPrefab;
    private indicatorPos;
    private damageIndicatorBin;
    constructor();
    OnStart(): void;
    CreateDamageIndicator(amount: number, criticalHit: boolean, damageType: DamageType): void;
}
