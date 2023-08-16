import { OnStart } from "@easy-games/flamework-core";
export declare class AmbientSoundController implements OnStart {
    private ambientSource;
    private musicSource;
    constructor();
    OnStart(): void;
    SetAmbientVolume(val: number): void;
    SetMusicVolume(val: number): void;
}
