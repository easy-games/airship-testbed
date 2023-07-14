import StringUtils from "../Util/StringUtil";
import { Task } from "../Util/Task";

const MAX_DISTANCE = 18;

export interface PlaySoundConfig {
	volumeScale: number;
}

export class AudioManager {
	public static SoundFolderPath = "Shared/Resources/Sound/";
	public static globalSource: AudioSource;
	private static soundFolderIndex: number;

	public static Init(): void {
		this.soundFolderIndex = this.SoundFolderPath.size();
		print("setting size: " + this.soundFolderIndex);
		this.globalSource = GameObject.Find("SoundUtil").GetComponent<AudioSource>();
	}

	public static PlayGlobal(sound: string, config?: PlaySoundConfig): void {
		const clip = this.LoadAudioClip(sound);
		if (!clip) {
			error("Failed to find sound: " + sound);
			return;
		}
		this.globalSource.PlayOneShot(clip, config?.volumeScale ?? 1);
	}

	public static PlayAtPosition(sound: string, position: Vector3, config?: PlaySoundConfig): void {
		const audioSource = this.GetAudioSource(position);
		audioSource.maxDistance = MAX_DISTANCE;
		audioSource.rolloffMode = AudioRolloffMode.Linear;
		const clip = this.LoadAudioClip(sound);
		if (!clip) {
			warn("Failed to find sound: " + sound);
			return;
		}
		audioSource.PlayOneShot(clip, config?.volumeScale ?? 1);
		Task.Delay(clip.length + 1, () => {
			Object.Destroy(audioSource);
		});
	}

	private static GetAudioSource(position: Vector3): AudioSource {
		const go = GameObject.CreateAtPos(position);
		const audioSource = go.AddComponent("AudioSource") as AudioSource;
		audioSource.spatialBlend = 1;
		return audioSource;
	}

	private static FriendlyPath(s: string): string {
		if (!StringUtils.includes(s, ".")) {
			s += ".ogg";
		}
		return s;
	}

	public static LoadAudioClip(sound: string): AudioClip | undefined {
		return AssetBridge.LoadAssetIfExists<AudioClip>(this.SoundFolderPath + this.FriendlyPath(sound));
	}

	public static GetLocalPathFromFullPath(fullPath: string) {
		print("Getting path from: " + fullPath);
		return fullPath.sub(this.soundFolderIndex);
	}
}
