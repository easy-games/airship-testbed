import { AudioManager, PlaySoundConfig } from "./AudioManager";

export enum AudioBundlePlayMode {
	MANUAL,
	SEQUENCE,
	RANDOM,
	RANDOM_NO_REPEAT,
}

export enum AudioBundleSpacialMode {
	GLOBAL,
	SPACIAL,
}

export class AudioClipBundle {
	public playMode: AudioBundlePlayMode = AudioBundlePlayMode.RANDOM_NO_REPEAT;
	public spacialMode: AudioBundleSpacialMode = AudioBundleSpacialMode.SPACIAL;
	public spacialPosition = Vector3.zero;
	public soundOptions: PlaySoundConfig = { volumeScale: 1 };

	private manualFolderPath = "";
	private clipPaths: string[];
	private possibleRandomIndex: number[] = [];
	private lastIndexPlayed = -1;

	public constructor(clipPaths: string[], manualFolderPath = "") {
		this.manualFolderPath = manualFolderPath + "/";
		this.clipPaths = clipPaths;
		this.RefreshPossibleRandomIndex();
	}

	public UpdatePaths(newPaths: string[]) {
		this.lastIndexPlayed = -1;
		this.clipPaths = newPaths;
		this.RefreshPossibleRandomIndex();
	}

	public PlayManual(index: number) {
		this.lastIndexPlayed = index;
		if (this.spacialMode === AudioBundleSpacialMode.SPACIAL) {
			AudioManager.PlayAtPosition(
				this.manualFolderPath + this.clipPaths[index],
				this.spacialPosition,
				this.soundOptions,
			);
		} else {
			AudioManager.PlayGlobal(this.manualFolderPath + this.clipPaths[index], this.soundOptions);
		}
	}

	public PlayNext() {
		if (this.playMode === AudioBundlePlayMode.MANUAL) {
			warn("Trying to play an audio bundle sequence without a mode selected");
			return;
		}

		//Play sounds in a sequence
		if (this.playMode === AudioBundlePlayMode.SEQUENCE) {
			//Step to the next index and play it
			this.lastIndexPlayed++;
			if (this.lastIndexPlayed >= this.clipPaths.size()) {
				this.lastIndexPlayed = 0;
			}
			this.PlayManual(this.lastIndexPlayed);
			return;
		}

		//Randomly play sounds
		let randomIndex = 0;
		let arraySize = this.clipPaths.size();
		if (this.playMode === AudioBundlePlayMode.RANDOM) {
			//Randomly select an index and play that sound
			randomIndex = this.GetRandomIndex(arraySize);
			print("Playing random number: " + randomIndex);
			this.PlayManual(randomIndex);
		} else if (this.playMode === AudioBundlePlayMode.RANDOM_NO_REPEAT) {
			//Randomly select an index ignoring the last played index
			randomIndex = this.GetRandomIndex(arraySize - 1);
			print("Playing random no repeat number: " + this.possibleRandomIndex[randomIndex]);
			//Possible arrays will always be one less than the total size because we are ignoring the last number used
			this.PlayManual(this.possibleRandomIndex[randomIndex]);

			this.RefreshPossibleRandomIndex();
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
		return math.round(math.random(0, length - 1));
	}
}
