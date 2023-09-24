import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSettingsController } from "../Settings/ClientSettingsController";

@Controller({})
export class AmbientSoundController implements OnStart {
	public ambientSource: AudioSource;
	public musicSource: AudioSource;

	constructor(private clientSettingsController: ClientSettingsController) {
		const ambientSoundGo = GameObject.Create("AmbientSound");
		this.ambientSource = ambientSoundGo.AddComponent("AudioSource") as AudioSource;
		this.ambientSource.volume = 0;

		const musicGo = GameObject.Create("Music");
		this.musicSource = musicGo.AddComponent("AudioSource") as AudioSource;
		this.musicSource.volume = 0;
	}

	OnStart(): void {
		this.clientSettingsController.WaitForSettingsLoaded().then(() => {
			this.SetAmbientVolume(this.clientSettingsController.GetAmbientVolume());
			this.SetMusicVolume(this.clientSettingsController.GetMusicVolume());
		});
	}

	public SetAmbientVolume(val: number): void {
		this.ambientSource.volume = val;
	}

	public SetMusicVolume(val: number): void {
		this.musicSource.volume = val;
	}
}
