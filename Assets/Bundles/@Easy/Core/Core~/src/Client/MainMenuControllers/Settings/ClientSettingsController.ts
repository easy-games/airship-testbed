import { Controller, Dependency, OnStart } from "Shared/Flamework";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { SetInterval } from "Shared/Util/Timer";
import { DecodeJSON, EncodeJSON } from "Shared/json";
import { AmbientSoundController } from "../AmbientSound/AmbientSoundController";
import { ClientSettingsFile } from "./ClientSettingsFile";

const defaultData: ClientSettingsFile = {
	mouseSensitivity: 0.5,
	touchSensitivity: 0.5,
	globalVolume: 1,
	ambientVolume: 0.1,
	musicVolume: 0.11,
	firstPersonFov: 80,
	thirdPersonFov: 80,
	screenshotRenderHD: false,
	screenshotShowUI: false,
	statusText: "",
};

@Controller({ loadOrder: -1 })
export class ClientSettingsController implements OnStart {
	public data: ClientSettingsFile;
	private unsavedChanges = false;
	private settingsLoaded = false;
	private onSettingsLoaded = new Signal<ClientSettingsFile>();

	constructor() {
		this.data = defaultData;
	}

	OnStart(): void {
		const savedContents = DiskManager.ReadFileAsync("ClientSettings.json");
		if (savedContents && savedContents !== "") {
			this.data = DecodeJSON(savedContents);
		} else {
			this.data = defaultData;
		}
		this.data.thirdPersonFov = 80;

		this.SetGlobalVolume(this.GetGlobalVolume());

		Task.Spawn(() => {
			this.settingsLoaded = true;
			this.onSettingsLoaded.Fire(this.data);
		});

		SetInterval(0.5, () => {
			if (this.unsavedChanges) {
				this.unsavedChanges = false;
				this.SaveSettings();
			}
		});
	}

	public MarkAsDirty(): void {
		this.unsavedChanges = true;
	}

	public async WaitForSettingsLoaded(): Promise<ClientSettingsFile> {
		if (this.settingsLoaded) {
			return this.data;
		}
		return new Promise<ClientSettingsFile>((resolve) => {
			this.onSettingsLoaded.Once(() => {
				resolve(this.data);
			});
		});
	}

	public SaveSettings(): void {
		DiskManager.WriteFileAsync("ClientSettings.json", EncodeJSON(this.data));
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

	public SetScreenshotShowUI(showUI: boolean) {
		this.data.screenshotShowUI = showUI;
		this.unsavedChanges = true;
	}

	public SetScreenshotRenderHD(renderHd: boolean) {
		this.data.screenshotRenderHD = renderHd;
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

	public GetScreenshotShowUI(): boolean {
		return this.data.screenshotShowUI;
	}

	public GetScreenshotRenderHD(): boolean {
		return this.data.screenshotRenderHD;
	}
}
