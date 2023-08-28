import { Controller, OnStart } from "@easy-games/flamework-core";

@Controller({})
export class AmbientSoundController implements OnStart {
	public ambientSource: AudioSource;
	public musicSource: AudioSource;

	constructor() {
		const ambientSoundGo = GameObject.Create("AmbientSound");
		this.ambientSource = ambientSoundGo.AddComponent("AudioSource") as AudioSource;

		const musicGo = GameObject.Create("Music");
		this.musicSource = musicGo.AddComponent("AudioSource") as AudioSource;
	}

	OnStart(): void {}

	public SetAmbientVolume(val: number): void {
		this.ambientSource.volume = val;
	}

	public SetMusicVolume(val: number): void {
		this.musicSource.volume = val;
	}
}
