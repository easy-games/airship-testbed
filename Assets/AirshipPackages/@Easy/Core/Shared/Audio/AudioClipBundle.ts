import {} from "@Easy/Core/Shared/Flamework";
import { AudioManager, PlaySoundConfig } from "./AudioManager";

export enum AudioBundlePlayMode {
	MANUAL,
	SEQUENCE,
	RANDOM,
	RANDOM_NO_REPEAT,
	LOOP,
	RANDOM_TO_LOOP,
}

export enum AudioBundleSpacialMode {
	GLOBAL,
	SPACIAL,
}

export class AudioClipBundle {
	public playMode: AudioBundlePlayMode = AudioBundlePlayMode.RANDOM_NO_REPEAT;
	public spacialMode: AudioBundleSpacialMode = AudioBundleSpacialMode.SPACIAL;
	public spacialPosition = Vector3.zero;
	public volumeScale = 1;

	public soundOptions: PlaySoundConfig = { volumeScale: 1, loop: false };
	private clips: AudioClip[];
	private possibleRandomIndex: number[] = [];
	private lastIndexPlayed = -1;
	private lastAudioSource: AudioSource | undefined;
	private tweeningStop = false;

	public constructor(playMode: AudioBundlePlayMode, clips: AudioClip[]) {
		this.playMode = playMode;
		this.clips = clips;
		this.RefreshPossibleRandomIndex();
	}

	public UpdateClips(clips: AudioClip[]) {
		this.Stop();
		this.clips = clips;
		this.RefreshPossibleRandomIndex();
	}

	public UpdateSpacialPosition(newPosition: Vector3) {
		if (this.lastAudioSource) {
			this.lastAudioSource.transform.position = newPosition;
		}
		this.spacialPosition = newPosition;
	}

	public Stop(fadeOutDuration = 0) {
		if (this.lastAudioSource) {
			if (fadeOutDuration > 0) {
				//FADE OUT
				this.tweeningStop = true;
				NativeTween.AudioSourceVolume(this.lastAudioSource, 0, fadeOutDuration);
				const tweeningAudio = this.lastAudioSource;
				this.lastAudioSource = undefined;
				task.delay(math.max(fadeOutDuration, 0.15), () => {
					//Cleanup faded out audio clip
					if (this.tweeningStop) {
						this.tweeningStop = false;
						tweeningAudio.Stop();
						PoolManager.ReleaseObject(tweeningAudio.gameObject);
					}
				});
			} else {
				//HARD STOP
				this.tweeningStop = false;
				this.lastAudioSource.Stop();
				this.lastAudioSource = undefined;
			}
		}
		this.lastIndexPlayed = -1;
	}

	public PlayManual(index: number, fadeInDuration = 0) {
		/* if (this.playMode === AudioBundlePlayMode.RANDOM_TO_LOOP) {
			print("Playing Audio Bundle: " + index);
		} */
		this.lastIndexPlayed = index;
		this.soundOptions.volumeScale = this.volumeScale;
		if (this.spacialMode === AudioBundleSpacialMode.SPACIAL) {
			this.lastAudioSource = AudioManager.PlayClipAtPosition(
				this.clips[index],
				this.spacialPosition,
				this.soundOptions,
			);
		} else {
			this.lastAudioSource = AudioManager.PlayClipGlobal(this.clips[index], this.soundOptions);
		}

		if (fadeInDuration > 0 && this.lastAudioSource) {
			const volume = this.lastAudioSource.volume;
			this.lastAudioSource.volume = 0;
			NativeTween.AudioSourceVolume(this.lastAudioSource, volume, fadeInDuration);
		}
	}

	public PlayNextAt(position: Vector3) {
		this.spacialMode = AudioBundleSpacialMode.SPACIAL;
		this.spacialPosition = position;
		this.PlayNext();
	}

	public PlayNext() {
		if (this.playMode === AudioBundlePlayMode.MANUAL) {
			warn("Trying to play an audio bundle sequence without a mode selected");
			return;
		}
		this.soundOptions.loop = false;

		//SEQUENCE
		if (this.playMode === AudioBundlePlayMode.SEQUENCE) {
			//Step to the next index and play it
			this.StepIndex();
			this.PlayManual(this.lastIndexPlayed);
			return;
		}

		//LOOP & RANDOM TO LOOP
		const arraySize = this.clips.size();
		const lastIndex = arraySize - 1;
		if (this.playMode === AudioBundlePlayMode.LOOP) {
			this.soundOptions.loop = true;
			this.PlayManual(lastIndex);
		}

		//RANDOM play sounds
		let randomIndex = 0;
		if (this.playMode === AudioBundlePlayMode.RANDOM) {
			//Randomly select an index and play that sound
			randomIndex = this.GetRandomIndex(arraySize);
			//print("Playing random number: " + randomIndex);
			this.PlayManual(randomIndex);
		} else if (this.playMode === AudioBundlePlayMode.RANDOM_NO_REPEAT) {
			//Randomly select an index ignoring the last played index
			randomIndex = this.GetRandomIndex(lastIndex);
			//print("Playing random no repeat number: " + this.possibleRandomIndex[randomIndex]);
			//Possible arrays will always be one less than the total size because we are ignoring the last number used
			this.PlayManual(this.possibleRandomIndex[randomIndex]);

			this.RefreshPossibleRandomIndex();
		} else if (this.playMode === AudioBundlePlayMode.RANDOM_TO_LOOP && this.lastIndexPlayed !== lastIndex) {
			//RANDOM TO LOOP - sending to the loop after a delay
			randomIndex = this.GetRandomIndex(lastIndex);
			this.PlayManual(randomIndex);

			//print("Playing random before loop: " + randomIndex);
			if (this.lastAudioSource) {
				const delayLength = math.max(0.1, this.clips[this.lastIndexPlayed].length - 0.15);
				//print("Delaying: " + delayLength);
				task.delay(delayLength, () => {
					if (this.lastAudioSource && this.lastAudioSource.isPlaying) {
						//print("Transition to Looping Audio" + lastIndex + ": " + this.clips[lastIndex]);
						//Fade out current sound
						this.Stop(0.35);
					}
					//Play a Loop
					//print("Playing new loop");
					this.soundOptions.loop = true;
					this.PlayManual(lastIndex, 0.15);
				});
			}
		}
	}

	private StepIndex() {
		this.lastIndexPlayed++;
		if (this.lastIndexPlayed >= this.clips.size()) {
			this.lastIndexPlayed = 0;
		}
	}

	private RefreshPossibleRandomIndex() {
		this.possibleRandomIndex.clear();
		let randomStep = 0;
		for (let i = 0; i < this.clips.size(); i++) {
			if (i !== this.lastIndexPlayed) {
				this.possibleRandomIndex[randomStep] = i;
				randomStep++;
			}
		}
	}

	private GetRandomIndex(length: number) {
		return math.round(math.random(0, length - 1));
	}
}
