import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { AmbientSoundController } from "../AmbientSound/AmbientSoundController";

@Controller({})
export class ClientSettingsController implements OnStart {
	private mouseSensitivity = 0.5;
	private touchSensitivity = 0.5;
	private globalVolume = 1;
	private ambientVolume = 0.14;
	private musicVolume = 0.11;
	private firstPersonFov = 85;
	private thirdPersonFov = 100;

	constructor() {
		this.LoadSettings();
	}

	OnStart(): void {}

	private LoadSettings(): void {
		this.SetAmbientVolume(0.1);
	}

	public SaveSettings(): void {}

	public GetMouseSensitivity(): number {
		return this.mouseSensitivity;
	}

	public SetMouseSensitivity(value: number): void {
		this.mouseSensitivity = value;
	}

	public GetTouchSensitivity(): number {
		return this.touchSensitivity;
	}

	public SetTouchSensitivity(value: number): void {
		this.touchSensitivity = value;
	}

	public GetAmbientVolume(): number {
		return this.ambientVolume;
	}

	public SetAmbientVolume(val: number): void {
		this.ambientVolume = val;
		Dependency<AmbientSoundController>().SetAmbientVolume(val * 0.5);
	}

	public GetMusicVolume(): number {
		return this.musicVolume;
	}

	public SetMusicVolume(val: number): void {
		this.musicVolume = val;
		Dependency<AmbientSoundController>().SetMusicVolume(val * 0.5);
	}

	public SetGlobalVolume(volume: number) {
		this.globalVolume = volume;
		Bridge.SetVolume(volume);
	}

	public GetGlobalVolume(): number {
		return this.globalVolume;
	}

	public GetFirstPersonFov(): number {
		return this.firstPersonFov;
	}

	public GetThirdPersonFov(): number {
		return this.thirdPersonFov;
	}
}
