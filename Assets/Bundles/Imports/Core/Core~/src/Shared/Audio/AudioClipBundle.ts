import { Task } from "Shared/Util/Task";
import { AudioManager, PlaySoundConfig } from "./AudioManager";
import {} from "@easy-games/flamework-core";

export enum AudioBundlePlayMode {
	MANUAL,
	SEQUENCE,
	RANDOM,
	RANDOM_NO_REPEAT,
	LOOP,
	RANDOM_TO_LOOP
}

export enum AudioBundleSpacialMode {
	GLOBAL,
	SPACIAL,
}

export class AudioClipBundle {
	public playMode: AudioBundlePlayMode = AudioBundlePlayMode.RANDOM_NO_REPEAT;
	public spacialMode: AudioBundleSpacialMode = AudioBundleSpacialMode.SPACIAL;
	public spacialPosition = Vector3.zero;
	public volumeScale: number = 1;

	private soundOptions: PlaySoundConfig = { volumeScale: 1, loop: false};
	private manualFolderPath = "";
	private clipPaths: string[];
	private possibleRandomIndex: number[] = [];
	private lastIndexPlayed = -1;
	private lastAudioSource: AudioSource | undefined;

	public constructor(clipPaths: string[], manualFolderPath = "") {
		this.manualFolderPath = manualFolderPath + "/";
		this.clipPaths = clipPaths;
		this.RefreshPossibleRandomIndex();
	}

	public UpdatePaths(newPaths: string[]) {
		this.Stop();
		this.clipPaths = newPaths;
		this.RefreshPossibleRandomIndex();
	}

	public Stop(){
		this.lastAudioSource?.Stop();
		this.lastIndexPlayed = -1;
	}

	public PlayManual(index: number) {
		this.lastIndexPlayed = index;
		this.soundOptions.volumeScale = this.volumeScale;
		if (this.spacialMode === AudioBundleSpacialMode.SPACIAL) {
			this.lastAudioSource = AudioManager.PlayAtPosition(
				this.manualFolderPath + this.clipPaths[index],
				this.spacialPosition,
				this.soundOptions,
			);
		} else {
			this.lastAudioSource = AudioManager.PlayGlobal(this.manualFolderPath + this.clipPaths[index], this.soundOptions);
		}
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
		const lastIndex = this.clipPaths.size()-1;
		if(this.playMode === AudioBundlePlayMode.LOOP || 
			(this.playMode === AudioBundlePlayMode.RANDOM_TO_LOOP && this.lastIndexPlayed === lastIndex)){
				//print("Playing Loop: " + lastIndex + ": " +this.clipPaths[lastIndex]);
			this.soundOptions.loop = true;
			this.PlayManual(lastIndex);
			return;
		}

		//RANDOM play sounds
		let randomIndex = 0;
		let arraySize = this.clipPaths.size();
		if (this.playMode === AudioBundlePlayMode.RANDOM) {
			//Randomly select an index and play that sound
			randomIndex = this.GetRandomIndex(arraySize);
			//print("Playing random number: " + randomIndex);
			this.PlayManual(randomIndex);
		} else if (this.playMode === AudioBundlePlayMode.RANDOM_NO_REPEAT) {
			//Randomly select an index ignoring the last played index
			randomIndex = this.GetRandomIndex(arraySize - 1);
			//print("Playing random no repeat number: " + this.possibleRandomIndex[randomIndex]);
			//Possible arrays will always be one less than the total size because we are ignoring the last number used
			this.PlayManual(this.possibleRandomIndex[randomIndex]);

			this.RefreshPossibleRandomIndex();
		}else if (this.playMode === AudioBundlePlayMode.RANDOM_TO_LOOP && this.lastIndexPlayed !== lastIndex){
			//RANDOM TO LOOP - sending to the loop after a delay
			randomIndex = this.GetRandomIndex(arraySize - 1);
			this.PlayManual(randomIndex);

			const delayLength = this.lastAudioSource? this.lastAudioSource.clip.length-.15 : 1;
			Task.Delay(delayLength, ()=>{
				if(this.lastAudioSource && this.lastAudioSource.isPlaying){
					this.lastIndexPlayed = lastIndex;
					this.PlayNext();
				}
			})
		}

	}

	private StepIndex(){
		this.lastIndexPlayed++;
		if (this.lastIndexPlayed >= this.clipPaths.size()) {
			this.lastIndexPlayed = 0;
		}
	}

	private RefreshPossibleRandomIndex() {
		this.possibleRandomIndex.clear();
		let randomStep = 0;
		for (let i = 0; i < this.clipPaths.size(); i++) {
			if (i !== this.lastIndexPlayed) {
				this.possibleRandomIndex[randomStep] = i;
				randomStep++;
			}
		}
	}

	private GetRandomIndex(length: number) {
		return math.round(math.random(0, length));
	}
}
