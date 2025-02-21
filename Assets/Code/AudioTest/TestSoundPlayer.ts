import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";

export default class TestSoundPlayer extends AirshipBehaviour {
	public testAudioClip: AudioResource;
	public group: AudioMixerGroup;

	override Start(): void {
		print("Audio source: " + this.testAudioClip);
		let i = 0;
		while (task.wait(0.5)) {
			if (i++ > 20) break;
			AudioManager.PlayClipGlobal(this.testAudioClip, { mixerGroup: this.group });
		}
	}
}
