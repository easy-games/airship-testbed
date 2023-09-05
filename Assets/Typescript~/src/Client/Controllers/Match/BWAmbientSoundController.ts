import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { AmbientSoundController } from "Imports/Core/Client/MainMenuControllers/AmbientSound/AmbientSoundController";
import { ClientSettingsController } from "Imports/Core/Client/MainMenuControllers/Settings/ClientSettingsController";

@Controller({})
export class BWAmbientSoundController implements OnStart {
	private clips: AudioClip[] = [];

	constructor(private readonly ambientSoundController: AmbientSoundController) {}

	OnStart(): void {
		const ambientClip = AssetBridge.LoadAsset<AudioClip>("Shared/Resources/Sound/Ambience_Forest.ogg");
		this.ambientSoundController.ambientSource.spatialBlend = 0;
		this.ambientSoundController.ambientSource.loop = true;
		this.ambientSoundController.ambientSource.clip = ambientClip;
		this.ambientSoundController.ambientSource.volume = Dependency<ClientSettingsController>().GetAmbientVolume();
		this.ambientSoundController.ambientSource.Play();

		const musicClip = AssetBridge.LoadAsset<AudioClip>("Shared/Resources/Sound/MatchMidIntensity.ogg");
		this.ambientSoundController.musicSource.spatialBlend = 0;
		this.ambientSoundController.musicSource.loop = true;
		this.ambientSoundController.musicSource.clip = musicClip;
		this.ambientSoundController.musicSource.volume = Dependency<ClientSettingsController>().GetMusicVolume();
		this.ambientSoundController.musicSource.Play();

		// Hack to fix GC.
		// TODO: remove once GC fix is in.
		this.clips = [ambientClip, musicClip];
	}
}
