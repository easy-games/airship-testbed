import { OnStart } from "@easy-games/flamework-core";
export declare class ClientSettingsController implements OnStart {
    private mouseSensitivity;
    private touchSensitivity;
    private globalVolume;
    private ambientVolume;
    private musicVolume;
    private firstPersonFov;
    private thirdPersonFov;
    constructor();
    OnStart(): void;
    private LoadSettings;
    SaveSettings(): void;
    GetMouseSensitivity(): number;
    SetMouseSensitivity(value: number): void;
    GetTouchSensitivity(): number;
    SetTouchSensitivity(value: number): void;
    GetAmbientVolume(): number;
    SetAmbientVolume(val: number): void;
    GetMusicVolume(): number;
    SetMusicVolume(val: number): void;
    SetGlobalVolume(volume: number): void;
    GetGlobalVolume(): number;
    GetFirstPersonFov(): number;
    GetThirdPersonFov(): number;
}
