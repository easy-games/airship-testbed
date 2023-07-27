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
			error("PlayGlobal Failed to find sound: " + sound);
			return;
		}
		this.globalSource.PlayOneShot(clip, config?.volumeScale ?? 1);
	}

	public static PlayFullPathGlobal(fullPath: string, config?: PlaySoundConfig): void {
		const clip = this.LoadFullPathAudioClip(fullPath);
		if (!clip) {
			error("PlayFullPathGlobal Failed to find full path: " + fullPath);
			return;
		}
		this.globalSource.PlayOneShot(clip, config?.volumeScale ?? 1);
	}

	public static PlayAtPosition(sound: string, position: Vector3, config?: PlaySoundConfig): void {
		const clip = this.LoadAudioClip(sound);
		if (!clip) {
			warn("PlayAtPosition Failed to find sound: " + sound);
			return;
		}
		return this.PlayClipAtPosition(clip, position, config);
	}

	public static PlayFullPathAtPosition(fullPath: string, position: Vector3, config?: PlaySoundConfig): void {
		const clip = this.LoadFullPathAudioClip(fullPath);
		if (!clip) {
			warn("PlayFullPathAtPosition Failed to find full path: " + fullPath);
			return;
		}
		return this.PlayClipAtPosition(clip, position, config);
	}

	public static PlayClipAtPosition(clip: AudioClip, position: Vector3, config?: PlaySoundConfig): void {
		print("CLIP AT POSITION: " + clip);
		print("POSITION A");
		const audioSource = this.GetAudioSource(position);
		audioSource.maxDistance = MAX_DISTANCE;
		audioSource.rolloffMode = AudioRolloffMode.Linear;
		print("POSITION B");
		if (!clip) {
			warn("Trying to play unidentified clip");
			return;
		}
		print("POSITION C");
		audioSource.PlayOneShot(clip, config?.volumeScale ?? 1);
		print("POSITION D");
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
		return this.LoadFullPathAudioClip(this.SoundFolderPath + this.FriendlyPath(sound));
	}

	public static LoadFullPathAudioClip(fullPath: string): AudioClip | undefined {
		const clip = AssetBridge.LoadAssetIfExists<AudioClip>(fullPath);
		if (!clip) {
			warn("Unable to load clip: " + fullPath);
		}
		return clip;
	}

	public static GetLocalPathFromFullPath(fullPath: string) {
		return fullPath.sub(this.soundFolderIndex);
	}
}
