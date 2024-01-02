import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSettingsController } from "../Settings/ClientSettingsController";

@Controller({})
export class AmbientSoundController implements OnStart {
	public AmbientSource: AudioSource;
	public MusicSource: AudioSource;

	constructor(private clientSettingsController: ClientSettingsController) {
		const ambientSoundGo = GameObject.Create("AmbientSound");
		this.AmbientSource = ambientSoundGo.AddComponent("AudioSource") as AudioSource;
		this.AmbientSource.volume = 0;

		const musicGo = GameObject.Create("Music");
		this.MusicSource = musicGo.AddComponent("AudioSource") as AudioSource;
		this.MusicSource.volume = 0;
	}

	OnStart(): void {
		this.clientSettingsController.WaitForSettingsLoaded().then(() => {
			this.SetAmbientVolume(this.clientSettingsController.GetAmbientVolume());
			this.SetMusicVolume(this.clientSettingsController.GetMusicVolume());
		});
	}

	public SetAmbientVolume(val: number): void {
		this.AmbientSource.volume = val;
	}

	public SetMusicVolume(val: number): void {
		this.MusicSource.volume = val;
	}
}
