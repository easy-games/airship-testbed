import { Controller, Dependency, OnStart } from "@Easy/Core/Shared/Flamework";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { AmbientSoundController } from "../AmbientSound/AmbientSoundController";
import { ClientSettingsFile } from "./ClientSettingsFile";

const defaultData: ClientSettingsFile = {
	mouseSensitivity: 2,
	mouseSmoothing: 0.5,
	touchSensitivity: 0.5,
	globalVolume: 1,
	ambientVolume: 0.1,
	musicVolume: 0.11,
	screenshotRenderHD: false,
	screenshotShowUI: false,
	statusText: "",
	micDeviceName: undefined,
};

@Controller({ loadOrder: -1 })
export class ClientSettingsController implements OnStart {
	public data: ClientSettingsFile;
	private unsavedChanges = false;
	private settingsLoaded = false;
	private onSettingsLoaded = new Signal<ClientSettingsFile>();

	public micFrequency = 16_000;
	public micSampleLength = 100;

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

		contextbridge.callback<() => number>("ClientSettings:GetMouseSensitivity", () => {
			return this.GetMouseSensitivity();
		});

		contextbridge.callback<() => number>("ClientSettings:GetMouseSmoothing", () => {
			return this.GetMouseSmoothing();
		});

		contextbridge.callback<() => number>("ClientSettings:GetTouchSensitivity", () => {
			return this.GetTouchSensitivity();
		});

		// Microphone
		task.spawn(() => {
			if (!Bridge.HasMicrophonePermission()) {
				Bridge.RequestMicrophonePermissionAsync();
			}

			const micDevices = Bridge.GetMicDevices();
			if (this.data.micDeviceName !== undefined) {
				// const currentDeviceIndex = Bridge.GetCurrentMicDeviceIndex();
				for (let i = 0; i < micDevices.Length; i++) {
					const deviceName = micDevices.GetValue(i);
					if (deviceName === this.data.micDeviceName) {
						Bridge.SetMicDeviceIndex(i);
						Bridge.StartMicRecording(this.micFrequency, this.micSampleLength);
						return;
					}
				}
			}

			// fallback
			if (micDevices.Length > 0) {
				Bridge.SetMicDeviceIndex(0);
				Bridge.StartMicRecording(this.micFrequency, this.micSampleLength);
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

	public GetMouseSmoothing(): number {
		return this.data.mouseSmoothing;
	}

	public SetMouseSensitivity(value: number): void {
		this.data.mouseSensitivity = value;
		this.unsavedChanges = true;
	}

	public SetMouseSmoothing(value: number): void {
		this.data.mouseSmoothing = value;
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

	public GetScreenshotShowUI(): boolean {
		return this.data.screenshotShowUI;
	}

	public GetScreenshotRenderHD(): boolean {
		return this.data.screenshotRenderHD;
	}
}
