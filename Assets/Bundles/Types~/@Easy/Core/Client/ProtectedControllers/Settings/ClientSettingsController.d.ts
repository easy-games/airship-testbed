/// <reference types="compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { ClientSettingsFile } from "./ClientSettingsFile";
export declare class ClientSettingsController implements OnStart {
    data: ClientSettingsFile;
    private unsavedChanges;
    private settingsLoaded;
    private onSettingsLoaded;
    micFrequency: number;
    micSampleLength: number;
    constructor();
    OnStart(): void;
    MarkAsDirty(): void;
    WaitForSettingsLoaded(): Promise<ClientSettingsFile>;
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
    SetScreenshotShowUI(showUI: boolean): void;
    SetScreenshotRenderHD(renderHd: boolean): void;
    GetGlobalVolume(): number;
    GetScreenshotShowUI(): boolean;
    GetScreenshotRenderHD(): boolean;
}
