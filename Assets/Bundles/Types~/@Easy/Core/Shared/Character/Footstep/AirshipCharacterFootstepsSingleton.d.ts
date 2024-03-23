import { OnStart } from "../../Flamework";
import { Signal } from "../../Util/Signal";
import { CharacterFootstepSignal } from "./CharacterFootstepSignal";
export declare class AirshipCharacterFootstepsSingleton implements OnStart {
    private entityLastFootstepTime;
    onFootstep: Signal<CharacterFootstepSignal>;
    baseFootstepVolumeScale: number;
    foostepSoundsEnabled: boolean;
    private materialMap;
    constructor();
    OnStart(): void;
    private PlayFootstepSound;
}
