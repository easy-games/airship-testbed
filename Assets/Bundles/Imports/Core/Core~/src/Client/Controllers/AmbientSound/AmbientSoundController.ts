import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ClientSettingsController } from "../ClientSettings/ClientSettingsController";

@Controller({})
export class AmbientSoundController implements OnStart {
	private ambientSource: AudioSource;
	private musicSource: AudioSource;

	constructor() {
		const ambientSoundGo = GameObject.Create("AmbientSound");
		this.ambientSource = ambientSoundGo.AddComponent("AudioSource") as AudioSource;

		const musicGo = GameObject.Create("Music");
		this.musicSource = musicGo.AddComponent("AudioSource") as AudioSource;
	}

	OnStart(): void {
		const ambientClip = AssetBridge.LoadAsset<AudioClip>("Shared/Resources/Sound/Ambience_Forest.ogg");
		this.ambientSource.spatialBlend = 0;
		this.ambientSource.loop = true;
		this.ambientSource.clip = ambientClip;
		this.ambientSource.volume = Dependency<ClientSettingsController>().GetAmbientVolume();
		this.ambientSource.Play();

		const musicClip = AssetBridge.LoadAsset<AudioClip>("Shared/Resources/Sound/Music/MatchMidIntensity.ogg");
		this.musicSource.spatialBlend = 0;
		this.musicSource.loop = true;
		this.musicSource.clip = musicClip;
		this.musicSource.volume = Dependency<ClientSettingsController>().GetMusicVolume();
		this.musicSource.Play();
	}

	public SetAmbientVolume(val: number): void {
		this.ambientSource.volume = val;
	}

	public SetMusicVolume(val: number): void {
		this.musicSource.volume = val;
	}
}
