import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import StringUtils from "../Types/StringUtil";
import { Task } from "../Util/Task";

const MAX_DISTANCE = 18;

export interface PlaySoundConfig {
	volumeScale?: number;
	loop?: boolean;
	pitch?: number;
	maxDistance?: number;
	rollOffMode?: AudioRolloffMode;
}

export class AudioManager {
	public static soundFolderPath = "Shared/Resources/Sound/";
	private static soundFolderIndex: number;

	private static audioSourceTemplate: GameObject;
	private static globalAudioSources: Map<number, AudioSource> = new Map();

	public static Init(): void {
		this.soundFolderIndex = this.soundFolderPath.size();
		this.CacheAudioSources();
	}

	private static CacheAudioSources() {
		//Create a reference for all future audio sources
		this.audioSourceTemplate = GameObject.Create("PooledAudioSource");
		this.audioSourceTemplate.AddComponent<AudioSource>();
		this.audioSourceTemplate.SetActive(false);
		this.audioSourceTemplate.transform.SetParent(CoreRefs.rootTransform);

		PoolManager.PreLoadPool(this.audioSourceTemplate, 15, CoreRefs.rootTransform);
	}

	public static PlayGlobal(sound: string, config?: PlaySoundConfig) {
		const clip = this.LoadAudioClip(sound);
		if (!clip) {
			warn("PlayGlobal Failed to find sound: " + sound);
			return undefined;
		}
		return this.PlayClipGlobal(clip, config);
	}

	public static PlayFullPathGlobal(fullPath: string, config?: PlaySoundConfig) {
		const clip = this.LoadFullPathAudioClip(fullPath);
		if (!clip) {
			warn("PlayFullPathGlobal Failed to find full path: " + fullPath);
			return undefined;
		}
		return this.PlayClipGlobal(clip, config);
	}

	public static PlayClipGlobal(clip: AudioClip, config?: PlaySoundConfig): AudioSource | undefined {
		const audioSource = this.GetAudioSource(Vector3.zero);
		audioSource.spatialBlend = 0;
		audioSource.loop = config?.loop ?? false;
		audioSource.pitch = config?.pitch ?? 1;
		audioSource.rolloffMode = config?.rollOffMode ?? AudioRolloffMode.Logarithmic;
		audioSource.maxDistance = config?.maxDistance ?? 500;
		audioSource.volume = config?.volumeScale ?? 1;
		if (!clip) {
			warn("Trying to play unidentified clip");
			return undefined;
		}
		audioSource.PlayOneShot(clip);
		//audioSource.PlayOneShot(clip, );
		this.globalAudioSources.set(audioSource.gameObject.GetInstanceID(), audioSource);
		if (!audioSource.loop) {
			Task.Delay(clip.length + 1, () => {
				audioSource.Stop();
				this.globalAudioSources.delete(audioSource.gameObject.GetInstanceID());
				PoolManager.ReleaseObject(audioSource.gameObject);
			});
		}
		return audioSource;
	}

	public static StopGlobalAudio() {
		this.globalAudioSources.forEach((element) => {
			element?.Stop();
		});
	}

	public static PlayAtPosition(sound: string, position: Vector3, config?: PlaySoundConfig): AudioSource | undefined {
		const clip = this.LoadAudioClip(sound);
		if (!clip) {
			warn("PlayAtPosition Failed to find sound: " + sound);
			return undefined;
		}
		return this.PlayClipAtPosition(clip, position, config);
	}

	public static PlayFullPathAtPosition(
		fullPath: string,
		position: Vector3,
		config?: PlaySoundConfig,
	): AudioSource | undefined {
		const clip = this.LoadFullPathAudioClip(fullPath);
		if (!clip) {
			warn("PlayFullPathAtPosition Failed to find full path: " + fullPath);
			return undefined;
		}
		return this.PlayClipAtPosition(clip, position, config);
	}

	public static PlayClipAtPosition(
		clip: AudioClip,
		position: Vector3,
		config?: PlaySoundConfig,
	): AudioSource | undefined {
		const audioSource = this.GetAudioSource(position);
		audioSource.spatialBlend = 1;
		audioSource.loop = config?.loop ?? false;
		if (!clip) {
			warn("Trying to play unidentified clip");
			return undefined;
		}
		audioSource.rolloffMode = config?.rollOffMode ?? AudioRolloffMode.Logarithmic;
		audioSource.maxDistance = config?.maxDistance ?? 500;
		audioSource.pitch = config?.pitch ?? 1;
		audioSource.volume = config?.volumeScale ?? 1;
		audioSource.PlayOneShot(clip);
		if (!audioSource.loop) {
			task.delay(clip.length + 1, () => {
				audioSource.Stop();
				PoolManager.ReleaseObject(audioSource.gameObject);
			});
		}
		return audioSource;
	}

	private static GetAudioSource(position: Vector3): AudioSource {
		const go = PoolManager.SpawnObject(this.audioSourceTemplate, position, Quaternion.identity);
		go.transform.SetParent(CoreRefs.rootTransform);
		return go.GetComponent<AudioSource>()!;
	}

	private static FriendlyPath(s: string): string {
		if (!StringUtils.includes(s, ".")) {
			s += ".ogg";
		}
		return s;
	}

	public static LoadAudioClip(sound: string): AudioClip | undefined {
		//print("Loading clip: " + this.SoundFolderPath +":::"+this.FriendlyPath(sound));

		if (StringUtils.includes(sound, "@")) {
			return this.LoadFullPathAudioClip(this.FriendlyPath(sound));
		}
		return this.LoadFullPathAudioClip(this.FriendlyPath(sound));
	}

	public static LoadFullPathAudioClip(fullPath: string): AudioClip | undefined {
		const clip = AssetCache.LoadAssetIfExists<AudioClip>(fullPath);
		if (!clip) {
			warn("Unable to load clip: " + fullPath);
		}
		return clip;
	}

	public static GetLocalPathFromFullPath(fullPath: string) {
		return fullPath.sub(this.soundFolderIndex);
	}
}
