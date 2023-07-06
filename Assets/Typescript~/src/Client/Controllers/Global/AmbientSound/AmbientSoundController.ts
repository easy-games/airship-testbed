import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ClientSettingsController } from "../ClientSettings/ClientSettingsController";

@Controller({})
export class AmbientSoundController implements OnStart {
	private audioSource: AudioSource;

	constructor() {
		const go = GameObject.Create("AmbientSound");
		this.audioSource = go.AddComponent("AudioSource") as AudioSource;
	}

	OnStart(): void {
		const clip = AssetBridge.LoadAsset<AudioClip>("Shared/Resources/Sound/Ambience_Forest.ogg");

		this.audioSource.spatialBlend = 0;
		this.audioSource.loop = true;
		this.audioSource.clip = clip;
		this.audioSource.volume = Dependency<ClientSettingsController>().GetAmbientSound();
		this.audioSource.Play();
	}

	public SetVolume(val: number): void {
		this.audioSource.volume = val;
	}
}
