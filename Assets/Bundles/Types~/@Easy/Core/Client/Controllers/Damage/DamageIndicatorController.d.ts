import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { DamageType } from "../../../Shared/Damage/DamageType";
export declare class DamageIndicatorController implements OnStart {
    private combatEffectsCanvas;
    HitMarkerImage: Image;
    private hitMarkerBin;
    HitMarkerAudioClip: AudioClip | undefined;
    CriticalHitAudioClips: AudioClip[];
    private indicatorPrefab;
    private indicatorPos;
    private damageIndicatorBin;
    constructor();
    OnStart(): void;
    CreateDamageIndicator(amount: number, criticalHit: boolean, damageType: DamageType): void;
}
