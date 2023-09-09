import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { SetInterval } from "Shared/Util/Timer";
import { decode, encode } from "Shared/json";
import { AmbientSoundController } from "../AmbientSound/AmbientSoundController";
import { ClientSettingsFile } from "./ClientSettingsFile";

const defaultData: ClientSettingsFile = {
	mouseSensitivity: 0.5,
	touchSensitivity: 0.5,
	globalVolume: 1,
	ambientVolume: 0.1,
	musicVolume: 0.11,
	firstPersonFov: 85,
	thirdPersonFov: 100,
};

@Controller({})
export class ClientSettingsController implements OnStart {
	private data: ClientSettingsFile;
	private unsavedChanges = false;

	constructor() {
		const savedContents = DiskManager.ReadFileAsync("ClientSettings.json");
		if (savedContents && savedContents !== "") {
			this.data = decode(savedContents);
		} else {
			this.data = defaultData;
		}

		this.SetAmbientVolume(this.data.ambientVolume);

		SetInterval(3, () => {
			if (this.unsavedChanges) {
				this.unsavedChanges = false;
				this.SaveSettings();
			}
		});
	}

	OnStart(): void {}

	public SaveSettings(): void {
		DiskManager.WriteFileAsync("ClientSettings.json", encode(this.data));
	}

	public GetMouseSensitivity(): number {
		return this.data.mouseSensitivity;
	}

	public SetMouseSensitivity(value: number): void {
		this.data.mouseSensitivity = value;
		this.unsavedChanges = true;
	}

	public GetTouchSensitivity(): number {
		return this.data.touchSensitivity;
	}

	public SetTouchSensitivity(value: number): void {
		this.data.touchSensitivity = value;
		this.unsavedChanges = true;
	}

	public GetAmbientVolume(): number {
		return this.data.ambientVolume;
	}

	public SetAmbientVolume(val: number): void {
		this.data.ambientVolume = val;
		Dependency<AmbientSoundController>().SetAmbientVolume(val * 0.5);
		this.unsavedChanges = true;
	}

	public GetMusicVolume(): number {
		return this.data.musicVolume;
	}

	public SetMusicVolume(val: number): void {
		this.data.musicVolume = val;
		Dependency<AmbientSoundController>().SetMusicVolume(val * 0.5);
		this.unsavedChanges = true;
	}

	public SetGlobalVolume(volume: number) {
		this.data.globalVolume = volume;
		Bridge.SetVolume(volume);
		this.unsavedChanges = true;
	}

	public GetGlobalVolume(): number {
		return this.data.globalVolume;
	}

	public GetFirstPersonFov(): number {
		return this.data.firstPersonFov;
	}

	public GetThirdPersonFov(): number {
		return this.data.thirdPersonFov;
	}
}
