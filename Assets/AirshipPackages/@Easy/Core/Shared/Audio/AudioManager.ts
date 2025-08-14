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
	 * Sets the stereo pan of the Audio Source.
	 */
	panStereo?: number;
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
	 * Sets a custom animation curve rolloff for the Audio Source. This will override
	 * rollOffMode.
	 */
	rolloffCustomCurve?: AnimationCurve;
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

	/**
	 * Mixer group for sound to play in.
	 */
	mixerGroup?: AudioMixerGroup;
}

interface PositionalPlaySoundConfig extends PlaySoundConfig {
	/**
	 * If a position is supplied this sound will be played positionally.
	 */
	position?: Vector3;
}

interface CleanupQueueItem {
	audioSource: AudioSource;
	aliveUntil?: number;
	isGlobal: boolean;
	playSoundConfig?: PlaySoundConfig;
}

/**
 * A set of utilities that allow you to quickly play an Audio Clip with configuration.
 *
 * Audio sources are pooled for improved performance.
 */
export class AudioManager {
	private static audioSourceTemplate: GameObject | undefined;
	private static globalAudioSources: Map<number, AudioSource> = new Map();

	private static cleanupQueue = new Set<CleanupQueueItem>();

	public static Init(): void {
		this.CacheAudioSources();

		task.spawn(() => {
			debug.setmemorycategory("AudioManagerCleanup");

			const toRemove: CleanupQueueItem[] = [];

			while (task.wait(1)) {
				if (this.cleanupQueue.isEmpty()) {
					continue;
				}

				const now = Time.unscaledTime;
				for (const item of this.cleanupQueue) {
					let requiresCleanup = false;
					// If audio is played through an AudioRandomContainer instead of clip
					// then we don't know when it'll be done playing (just poll)
					if (item.aliveUntil !== undefined) {
						requiresCleanup = now >= item.aliveUntil;
					} else {
						requiresCleanup = item.audioSource.IsDestroyed() || !item.audioSource.isPlaying;
					}

					if (requiresCleanup) {
						task.spawn(() => {
							if (item.audioSource.IsDestroyed()) return;

							item.audioSource.Stop();
							if (item.isGlobal) {
								this.globalAudioSources.delete(item.audioSource.gameObject.GetInstanceID());
							}
							PoolManager.ReleaseObject(item.audioSource.gameObject);
						});
						toRemove.push(item);
					}
				}

				for (const item of toRemove) {
					this.cleanupQueue.delete(item);
				}
				toRemove.clear();
			}
		});
	}

	private static CacheAudioSources() {
		//Create a reference for all future audio sources
		this.audioSourceTemplate = GameObject.Create("PooledAudioSource");
		const audioSource = this.audioSourceTemplate.AddComponent<AudioSource>();
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

	/**
	 * Plays an audio resource. It will play positionally if a position is supplied in the config. Otherwise
	 * the audio will play globally.
	 *
	 * @param audioResource Audio resource to play. This can be either an AudioClip or an AudioRandomConatiner.
	 * @param config Configure how the sound is played.
	 */
	public static PlayClip(audioResource: AudioResource, config?: PositionalPlaySoundConfig): AudioSource | undefined {
		if (config?.position) {
			return this.PlayClipAtPosition(audioResource, config.position, config);
		} else {
			return this.PlayClipGlobal(audioResource, config);
		}
	}

	public static PlayClipGlobal(audioResource: AudioResource, config?: PlaySoundConfig): AudioSource | undefined {
		if (!audioResource) {
			warn("Cannot play sound: AudioResource is undefined.");
			return undefined;
		}

		const audioSource = this.GetAudioSource(Vector3.zero, config?.audioSourceTemplate);
		const providedAudioSource = config?.audioSourceTemplate !== undefined;

		if (!providedAudioSource) {
			// Backwards compatibility
			try {
				Bridge.SetDefaultAudioSourceValues(audioSource);
			} catch (err) {
				audioSource.volume = config?.volumeScale ?? 1;
				audioSource.loop = config?.loop ?? false;
				audioSource.pitch = config?.pitch ?? 1;
				audioSource.panStereo = config?.panStereo ?? 0;
				audioSource.minDistance = config?.minDistance ?? 1;
				audioSource.maxDistance = config?.maxDistance ?? 500;
				audioSource.rolloffMode = config?.rollOffMode ?? AudioRolloffMode.Logarithmic;
				audioSource.dopplerLevel = config?.dopplerLevel ?? 0;
				if (config?.mixerGroup) {
					audioSource.outputAudioMixerGroup = config.mixerGroup;
				}
				if (config?.rolloffCustomCurve) {
					audioSource.SetCustomCurve(AudioSourceCurveType.CustomRolloff, config.rolloffCustomCurve);
				}
			}
		}
		this.SetAudioValuesToConfig(audioSource, config);

		audioSource.spatialBlend = 0;
		audioSource.resource = audioResource;
		audioSource.PlayDelayed(0.01);

		this.globalAudioSources.set(audioSource.gameObject.GetInstanceID(), audioSource);
		if (!audioSource.loop) {
			const clip = audioSource.clip;
			this.cleanupQueue.add({
				audioSource,
				aliveUntil: clip ? Time.unscaledTime + clip.length + 1 : undefined,
				isGlobal: true,
				playSoundConfig: config,
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
		audioResource: AudioResource,
		position: Vector3,
		config?: PlaySoundConfig,
	): AudioSource | undefined {
		if (!audioResource) {
			warn("Cannot play sound: AudioResource is undefined.");
			return undefined;
		}

		const audioSource = this.GetAudioSource(position, config?.audioSourceTemplate);
		const providedAudioSource = config?.audioSourceTemplate !== undefined;

		if (!providedAudioSource) {
			// Backwards compatibility
			try {
				Bridge.SetDefaultAudioSourceValues(audioSource);
			} catch (err) {
				audioSource.volume = config?.volumeScale ?? 1;
				audioSource.loop = config?.loop ?? false;
				audioSource.pitch = config?.pitch ?? 1;
				audioSource.panStereo = config?.panStereo ?? 0;
				audioSource.minDistance = config?.minDistance ?? 1;
				audioSource.maxDistance = config?.maxDistance ?? 500;
				audioSource.rolloffMode = config?.rollOffMode ?? AudioRolloffMode.Logarithmic;
				audioSource.dopplerLevel = config?.dopplerLevel ?? 0;
				if (config?.mixerGroup) {
					audioSource.outputAudioMixerGroup = config.mixerGroup;
				}
				if (config?.rolloffCustomCurve) {
					audioSource.SetCustomCurve(AudioSourceCurveType.CustomRolloff, config.rolloffCustomCurve);
				}
			}
		}
		this.SetAudioValuesToConfig(audioSource, config);

		audioSource.spatialBlend = 1;
		audioSource.resource = audioResource;
		audioSource.PlayDelayed(0.01);

		if (!audioSource.loop) {
			const clip = audioSource.clip;
			this.cleanupQueue.add({
				audioSource,
				aliveUntil: clip ? Time.unscaledTime + clip.length + 1 : undefined,
				isGlobal: false,
				playSoundConfig: config,
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
		if (!this.audioSourceTemplate) {
			this.CacheAudioSources();
		}

		const go = PoolManager.SpawnObject(this.audioSourceTemplate!, position, Quaternion.identity);
		// const go = Object.Instantiate(this.audioSourceTemplate!, position, Quaternion.identity);
		go.transform.SetParent(CoreRefs.rootTransform);
		go.SetActive(true);
		return go.GetComponent<AudioSource>()!;
	}

	private static SetAudioValuesToConfig(audioSource: AudioSource, playSoundConfig?: PlaySoundConfig) {
		if (!playSoundConfig) return;
		if (playSoundConfig.volumeScale !== undefined) {
			audioSource.volume = playSoundConfig.volumeScale;
		}
		if (playSoundConfig.loop !== undefined) {
			audioSource.loop = playSoundConfig.loop;
		}
		if (playSoundConfig.pitch !== undefined) {
			audioSource.pitch = playSoundConfig.pitch;
		}
		if (playSoundConfig.panStereo !== undefined) {
			audioSource.panStereo = playSoundConfig.panStereo;
		}
		if (playSoundConfig.maxDistance !== undefined) {
			audioSource.maxDistance = playSoundConfig.maxDistance;
		}
		if (playSoundConfig.minDistance !== undefined) {
			audioSource.minDistance = playSoundConfig.minDistance;
		}
		if (playSoundConfig.rollOffMode !== undefined) {
			audioSource.rolloffMode = playSoundConfig.rollOffMode;
		}
		if (playSoundConfig.dopplerLevel !== undefined) {
			audioSource.dopplerLevel = playSoundConfig.dopplerLevel;
		}
		if (playSoundConfig.rolloffCustomCurve) {
			audioSource.SetCustomCurve(AudioSourceCurveType.CustomRolloff, playSoundConfig.rolloffCustomCurve);
		}
		if (playSoundConfig.mixerGroup !== undefined) {
			audioSource.outputAudioMixerGroup = playSoundConfig.mixerGroup;
		}
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
