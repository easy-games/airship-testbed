import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Asset } from "../Asset";
import StringUtils from "../Types/StringUtil";

const MAX_DISTANCE = 18;

/**
 * Configuration for the Audio Source that will play your Audio Clip.
 */
export interface PlaySoundConfig {
	/**
	 * Sets the volume of the Audio Source.
	 */
	volumeScale?: number;
	/**
	 * Sets wether Audio Source will play looped. If true Audio Manager will not
	 * clean up your Audio Source automatically (you will need to destroy it when you
	 * no longer need the sound).
	 */
	loop?: boolean;
	/**
	 * Sets the pitch of the Audio Source.
	 */
	pitch?: number;
	/**
	 * Sets the max distance of the Audio Source.
	 */
	maxDistance?: number;
	/**
	 * Sets the min distance of the Audio Source.
	 */
	minDistance?: number;
	/**
	 * Sets the roll off mode of the Audio Source.
	 */
	rollOffMode?: AudioRolloffMode;
	/**
	 * This should be a Game Object with an Audio Source on it. Normally Audio Manager
	 * creates a new Audio Source to play your sound, but if you provide this template we
	 * will clone it and play your sound from this object. All other config properties work
	 * on top of this (for example if you supply volumeScale that will override the volume of
	 * your Audio Source).
	 */
	audioSourceTemplate?: GameObject;

	/**
	 * Defaults to 0.
	 */
	dopplerLevel?: number;
}

/**
 * A set of utilities that allow you to quickly play an Audio Clip with configuration.
 */
export class AudioManager {
	private static audioSourceTemplate: GameObject | undefined;
	private static globalAudioSources: Map<number, AudioSource> = new Map();

	public static Init(): void {
		this.CacheAudioSources();
	}

	private static CacheAudioSources() {
		//Create a reference for all future audio sources
		this.audioSourceTemplate = GameObject.Create("PooledAudioSource");
		this.audioSourceTemplate.AddComponent<AudioSource>();
		this.audioSourceTemplate.SetActive(false);
		this.audioSourceTemplate.transform.SetParent(CoreRefs.rootTransform);

		// PoolManager.PreLoadPool(this.audioSourceTemplate, 15, CoreRefs.rootTransform);
	}

	/**
	 * Loads an Audio Clip from path and plays it globally.
	 *
	 * @param sound Path to audio clip. Must be under ``Resources`` folder or else it won't exist in published game.
	 * @param config Audio Source configuration
	 * @returns Spawned Audio Source playing the clip (or undefined if the clip can't be loaded).
	 */
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
		const audioSource = this.GetAudioSource(Vector3.zero, config?.audioSourceTemplate);
		const providedAudioSource = config?.audioSourceTemplate !== undefined;

		audioSource.spatialBlend = 0;
		if (config?.loop !== undefined || !providedAudioSource) audioSource.loop = config?.loop ?? false;
		if (config?.pitch !== undefined || !providedAudioSource) audioSource.pitch = config?.pitch ?? 1;
		if (config?.rollOffMode !== undefined || !providedAudioSource)
			audioSource.rolloffMode = config?.rollOffMode ?? AudioRolloffMode.Logarithmic;
		if (config?.maxDistance !== undefined || !providedAudioSource)
			audioSource.maxDistance = config?.maxDistance ?? 500;
		if (config?.minDistance !== undefined || !providedAudioSource)
			audioSource.minDistance = config?.minDistance ?? 1;
		if (config?.volumeScale !== undefined || !providedAudioSource) audioSource.volume = config?.volumeScale ?? 1;
		if (config?.dopplerLevel !== undefined || !providedAudioSource)
			audioSource.dopplerLevel = config?.dopplerLevel ?? 0;
		if (!clip) {
			warn("Trying to play unidentified clip");
			return undefined;
		}
		audioSource.PlayOneShot(clip);
		//audioSource.PlayOneShot(clip, );
		this.globalAudioSources.set(audioSource.gameObject.GetInstanceID(), audioSource);
		if (!audioSource.loop) {
			task.unscaledDelay(clip.length + 1, () => {
				if (audioSource.IsDestroyed()) return;
				audioSource.Stop();
				this.globalAudioSources.delete(audioSource.gameObject.GetInstanceID());
				PoolManager.ReleaseObject(audioSource.gameObject);
				// Object.Destroy(audioSource.gameObject);
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
		const audioSource = this.GetAudioSource(position, config?.audioSourceTemplate);
		const providedAudioSource = config?.audioSourceTemplate !== undefined;
		audioSource.spatialBlend = 1;

		if (config?.loop !== undefined || !providedAudioSource) audioSource.loop = config?.loop ?? false;
		if (!clip) {
			warn("Trying to play unidentified clip");
			return undefined;
		}
		if (config?.rollOffMode !== undefined || !providedAudioSource)
			audioSource.rolloffMode = config?.rollOffMode ?? AudioRolloffMode.Logarithmic;
		if (config?.maxDistance !== undefined || !providedAudioSource)
			audioSource.maxDistance = config?.maxDistance ?? 500;
		if (config?.minDistance !== undefined || !providedAudioSource)
			audioSource.minDistance = config?.minDistance ?? 1;
		if (config?.pitch !== undefined || !providedAudioSource) audioSource.pitch = config?.pitch ?? 1;
		if (config?.volumeScale !== undefined || !providedAudioSource) audioSource.volume = config?.volumeScale ?? 1;
		audioSource.PlayOneShot(clip);
		if (!audioSource.loop) {
			task.unscaledDelay(clip.length + 1, () => {
				if (audioSource) {
					audioSource.Stop();
					PoolManager.ReleaseObject(audioSource.gameObject);
				}
			});
		}
		return audioSource;
	}

	private static GetAudioSource(position: Vector3, customAudioSourceTemplate?: GameObject): AudioSource {
		if (customAudioSourceTemplate) {
			const go = Object.Instantiate(customAudioSourceTemplate, position, Quaternion.identity);
			const audioSource = go.GetComponent<AudioSource>();
			assert(
				audioSource,
				"Failed to play sound: Your audioSourceTemplate does not have an Audio Source component on it.",
			);
			return audioSource;
		}
		if (!this.audioSourceTemplate || this.audioSourceTemplate.IsDestroyed()) {
			this.CacheAudioSources();
		}
		const go = PoolManager.SpawnObject(this.audioSourceTemplate!, position, Quaternion.identity);
		// const go = Object.Instantiate(this.audioSourceTemplate!, position, Quaternion.identity);
		go.transform.SetParent(CoreRefs.rootTransform);
		go.SetActive(true);
		return go.GetComponent<AudioSource>()!;
	}

	private static FriendlyPath(s: string): string {
		if (!StringUtils.includes(s, ".")) {
			s += ".ogg";
		}
		return s;
	}

	public static LoadAudioClip(sound: string): AudioClip | undefined {
		return this.LoadFullPathAudioClip(this.FriendlyPath(sound));
	}

	public static LoadFullPathAudioClip(fullPath: string): AudioClip | undefined {
		const clip = Asset.LoadAssetIfExists<AudioClip>(fullPath);
		if (!clip) {
			warn("Unable to load clip: " + fullPath);
		}
		return clip;
	}
}
