import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { AmbientSoundController } from "@Easy/Core/Client/MainMenuControllers/AmbientSound/AmbientSoundController";
import { ClientSettingsController } from "@Easy/Core/Client/MainMenuControllers/Settings/ClientSettingsController";

@Controller({})
export class BWAmbientSoundController implements OnStart {
	private clips: AudioClip[] = [];

	constructor(private readonly ambientSoundController: AmbientSoundController) {}

	OnStart(): void {
		const ambientClip = AssetBridge.Instance.LoadAsset<AudioClip>("Shared/Resources/Sound/Ambience_Forest.ogg");
		this.ambientSoundController.AmbientSource.spatialBlend = 0;
		this.ambientSoundController.AmbientSource.loop = true;
		this.ambientSoundController.AmbientSource.clip = ambientClip;
		this.ambientSoundController.AmbientSource.volume = Dependency<ClientSettingsController>().GetAmbientVolume();
		this.ambientSoundController.AmbientSource.Play();

		const musicClip = AssetBridge.Instance.LoadAsset<AudioClip>("Shared/Resources/Sound/MatchMidIntensity.ogg");
		this.ambientSoundController.MusicSource.spatialBlend = 0;
		this.ambientSoundController.MusicSource.loop = true;
		this.ambientSoundController.MusicSource.clip = musicClip;
		this.ambientSoundController.MusicSource.volume = Dependency<ClientSettingsController>().GetMusicVolume();
		this.ambientSoundController.MusicSource.Play();

		// Hack to fix GC.
		// TODO: remove once GC fix is in.
		this.clips = [ambientClip, musicClip];
	}
}
