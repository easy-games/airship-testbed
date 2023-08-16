/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
export interface PlaySoundConfig {
    volumeScale: number;
}
export declare class AudioManager {
    static SoundFolderPath: string;
    static globalSource: AudioSource;
    private static soundFolderIndex;
    static Init(): void;
    static PlayGlobal(sound: string, config?: PlaySoundConfig): void;
    static PlayFullPathGlobal(fullPath: string, config?: PlaySoundConfig): void;
    static PlayClipGlobal(clip: AudioClip, config?: PlaySoundConfig): void;
    static StopGlobalAudio(): void;
    static PlayAtPosition(sound: string, position: Vector3, config?: PlaySoundConfig): AudioSource | undefined;
    static PlayFullPathAtPosition(fullPath: string, position: Vector3, config?: PlaySoundConfig): AudioSource | undefined;
    static PlayClipAtPosition(clip: AudioClip, position: Vector3, config?: PlaySoundConfig): AudioSource | undefined;
    private static GetAudioSource;
    private static FriendlyPath;
    static LoadAudioClip(sound: string): AudioClip | undefined;
    static LoadFullPathAudioClip(fullPath: string): AudioClip | undefined;
    static GetLocalPathFromFullPath(fullPath: string): string;
}
