import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { ClientSettingsController } from "../Settings/ClientSettingsController";

@Controller({})
export class AmbientSoundController {
	public ambientSource: AudioSource;
	public musicSource: AudioSource;

	constructor(private clientSettingsController: ClientSettingsController) {
		const ambientSoundGo = GameObject.Create("AmbientSound");
		this.ambientSource = ambientSoundGo.AddComponent<AudioSource>();
		this.ambientSource.volume = 0;
		this.ambientSource.transform.SetParent(CoreRefs.rootTransform);

		const musicGo = GameObject.Create("Music");
		this.musicSource = musicGo.AddComponent<AudioSource>();
		this.musicSource.volume = 0;
		this.musicSource.transform.SetParent(CoreRefs.rootTransform);
	}

	protected OnStart(): void {
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
