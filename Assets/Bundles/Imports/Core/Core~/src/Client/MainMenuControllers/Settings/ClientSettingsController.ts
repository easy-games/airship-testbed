import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
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
	firstPersonFov: 80,
	thirdPersonFov: 90,
};

@Controller({ loadOrder: -1 })
export class ClientSettingsController implements OnStart {
	private data: ClientSettingsFile;
	private unsavedChanges = false;
	public onSettingsLoaded = new Signal<void>();

	constructor() {
		this.data = defaultData;
	}

	OnStart(): void {
		const savedContents = DiskManager.ReadFileAsync("ClientSettings.json");
		if (savedContents && savedContents !== "") {
			this.data = decode(savedContents);
		} else {
			this.data = defaultData;
		}

		this.SetAmbientVolume(this.data.ambientVolume);
		this.unsavedChanges = false;

		Task.Spawn(() => {
			this.onSettingsLoaded.Fire();
		});

		SetInterval(3, () => {
			if (this.unsavedChanges) {
				this.unsavedChanges = false;
				this.SaveSettings();
			}
		});
	}

	public SaveSettings(): void {
		DiskManager.WriteFileAsync("ClientSettings.json", encode(this.data));
		print("Saved settings to disk.");
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
