/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { PlaySoundConfig } from "./AudioManager";
export declare enum AudioBundlePlayMode {
    MANUAL = 0,
    SEQUENCE = 1,
    RANDOM = 2,
    RANDOM_NO_REPEAT = 3
}
export declare enum AudioBundleSpacialMode {
    GLOBAL = 0,
    SPACIAL = 1
}
export declare class AudioClipBundle {
    playMode: AudioBundlePlayMode;
    spacialMode: AudioBundleSpacialMode;
    spacialPosition: Vector3;
    soundOptions: PlaySoundConfig;
    private manualFolderPath;
    private clipPaths;
    private possibleRandomIndex;
    private lastIndexPlayed;
    constructor(clipPaths: string[], manualFolderPath?: string);
    UpdatePaths(newPaths: string[]): void;
    PlayManual(index: number): void;
    PlayNext(): void;
    private RefreshPossibleRandomIndex;
    private GetRandomIndex;
}
