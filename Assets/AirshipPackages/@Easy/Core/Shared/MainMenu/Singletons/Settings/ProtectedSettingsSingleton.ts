import { Game } from "@Easy/Core/Shared/Game";
import { ClientSettingsFile } from "@Easy/Core/Shared/MainMenu/Singletons/Settings/ClientSettingsFile";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Singleton } from "../../../Flamework";
import { CoreAction } from "../../../Input/AirshipCoreAction";
import { SerializableAction } from "../../../Input/InputAction";
import { Protected } from "../../../Protected";
import { Signal } from "../../../Util/Signal";
import { SetInterval } from "../../../Util/Timer";
import { InternalGameSetting, InternalGameSettingType, InternalSliderGameSetting } from "./InternalGameSetting";

const defaultData: ClientSettingsFile = {
	mouseSensitivity: 2,
	mouseSmoothing: 0,
	touchSensitivity: 0.5,
	globalVolume: 1,
	ambientVolume: 0.1,
	musicVolume: 0.11,
	screenshotRenderHD: false,
	screenshotShowUI: false,
	statusText: "",
	micDeviceName: undefined,
	microphoneEnabled: false,
	coreKeybindOverrides: undefined,
	gameKeybindOverrides: {},
};

interface SavedGameSettings {
	gameSettings: InternalGameSetting[];
}

/**
 * Notes:
 * I don't like all of the getters and setters in here. We should
 * clean that up eventually.
 * - Luke
 */

/**
 * @internal
 */
@Singleton({ loadOrder: -1 })
export class ProtectedSettingsSingleton {
	public data: ClientSettingsFile;
	private unsavedChanges = false;
	private settingsLoaded = false;
	private onSettingsLoaded = new Signal<ClientSettingsFile>();

	public micFrequency = 16_000;
	public micSampleLength = 100;

	public gameSettings = new Map<string, InternalGameSetting>();
	private savedGameSettings: SavedGameSettings = {
		gameSettings: [],
	};

	constructor() {
		Protected.settings = this;

		this.data = defaultData;

		contextbridge.callback<() => number>("ClientSettings:GetMouseSensitivity", () => {
			return this.GetMouseSensitivity();
		});

		contextbridge.callback<() => number>("ClientSettings:GetMouseSmoothing", () => {
			return this.GetMouseSmoothing();
		});

		contextbridge.callback<() => number>("ClientSettings:GetTouchSensitivity", () => {
			return this.GetTouchSensitivity();
		});

		contextbridge.callback(
			"Settings:AddSlider",
			(fromContext, name: string, startingValue: number, min: number, max: number) => {
				assert(min < max, "Slider: max must be greater than min.");

				if (this.gameSettings.has(name)) {
					error(`A setting named "${name}" already exists.`);
				}

				let value = startingValue;
				try {
					for (let s of this.savedGameSettings.gameSettings) {
						if (s.name === name && s.type === InternalGameSettingType.Slider) {
							value = math.clamp(s.value as number, min, max);
						}
					}
				} catch (err) {
					warn("Failed to load saved game setting: " + name + ". " + err);
				}

				const setting: InternalSliderGameSetting = {
					name,
					type: InternalGameSettingType.Slider,
					value,
					min,
					max,
				};
				this.gameSettings.set(name, setting);
			},
		);

		contextbridge.callback("Settings:Slider:GetValue", (from: LuauContext, name: string) => {
			const setting = this.gameSettings.get(name);
			if (!setting) {
				warn(`Tried to get setting that didn't exist: "${name}"`);
				return 1;
			}
			return setting.value as number;
		});
	}

	public SetGameSetting(name: string, value: unknown): void {
		const setting = this.gameSettings.get(name);
		assert(setting, `Tried to set game setting that didn't exist: ${name}`);

		setting.value = value;
		if (setting.type === InternalGameSettingType.Slider) {
			contextbridge.broadcast("Settings:Slider:OnChanged", name, value);
		}
		this.MarkAsDirty();
	}

	private LoadGameSettingsFromDisk(): void {
		Game.WaitForGameData();
		DiskManager.EnsureDirectory("GameSettings");
		const raw = DiskManager.ReadFileAsync(`GameSettings/${Game.gameId}.json`);
		if (raw && raw !== "") {
			this.savedGameSettings = json.decode<SavedGameSettings>(raw);

			// This is for the case when gamedev registers settings before we finish loading.
			for (let s of this.savedGameSettings.gameSettings) {
				const realSetting = this.gameSettings.get(s.name);
				if (realSetting && realSetting.type === s.type) {
					this.SetGameSetting(s.name, s.value);
				}
			}
		} else {
			this.savedGameSettings = {
				gameSettings: [],
			};
		}
	}

	protected OnStart(): void {
		if (!Game.IsClient()) return;

		task.spawn(() => {
			this.LoadGameSettingsFromDisk();
		});

		const savedContents = DiskManager.ReadFileAsync("ClientSettings.json");
		if (savedContents && savedContents !== "") {
			this.data = json.decode(savedContents);
			this.data = { ...defaultData, ...this.data };
		} else {
			this.data = defaultData;
		}

		this.SetGlobalVolume(this.GetGlobalVolume());

		task.spawn(() => {
			this.settingsLoaded = true;
			this.onSettingsLoaded.Fire(this.data);
		});

		SetInterval(0.5, () => {
			if (this.unsavedChanges) {
				this.unsavedChanges = false;
				this.SaveSettings();
			}
		});

		// Microphone
		task.spawn(() => {
			if (!this.data.microphoneEnabled) {
				return;
			}
			if (!Bridge.HasMicrophonePermission()) {
				return;
			}
			this.PickMicAndStartRecording();
		});
	}

	public PickMicAndStartRecording(): void {
		const micDevices = Bridge.GetMicDevices();
		if (this.data.micDeviceName !== undefined) {
			// const currentDeviceIndex = Bridge.GetCurrentMicDeviceIndex();
			for (const i of $range(0, micDevices.size() - 1)) {
				const deviceName = micDevices[i];
				if (deviceName === this.data.micDeviceName) {
					Bridge.SetMicDeviceIndex(i);
					this.StartMicRecording();
					return;
				}
			}
		}

		// fallback
		if (micDevices.size() > 0) {
			Bridge.SetMicDeviceIndex(0);
			this.StartMicRecording();
		}
	}

	public SetMicrophoneEnabled(val: boolean): void {
		this.data.microphoneEnabled = val;
		if (val) {
			this.PickMicAndStartRecording();
		} else {
			Bridge.StopMicRecording();
		}
	}

	public StartMicRecording(): void {
		Bridge.StartMicRecording(this.micFrequency, this.micSampleLength);
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
		DiskManager.WriteFileAsync("ClientSettings.json", json.encode(this.data));
		if (Game.gameData) {
			let saved: SavedGameSettings = {
				gameSettings: ObjectUtils.values(this.gameSettings).map((s) => {
					// strip un-needed data
					return {
						name: s.name,
						type: s.type,
						value: s.value,
					};
				}),
			};
			DiskManager.EnsureDirectory("GameSettings");
			DiskManager.WriteFileAsync(`GameSettings/${Game.gameId}.json`, json.encode(saved));
		}
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

	public SetCoreKeybindOverrides(value: { [key in CoreAction]?: SerializableAction }): void {
		this.data.coreKeybindOverrides = value;
		this.MarkAsDirty();
	}

	public GetCoreKeybindOverrides(): { [key in CoreAction]?: SerializableAction } | undefined {
		return this.data.coreKeybindOverrides;
	}

	public UpdateGameKeybindOverrides(gameId: string, action: SerializableAction): void {
		const gameKeybinds = this.data.gameKeybindOverrides[gameId] ?? {};
		gameKeybinds[action.name] = action;
		this.data.gameKeybindOverrides[gameId] = gameKeybinds;
		this.MarkAsDirty();
	}

	public GetGameKeybindOverrides(gameId: string): { [key: string]: SerializableAction } | undefined {
		return this.data.gameKeybindOverrides[gameId];
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

	public GetMusicVolume(): number {
		return this.data.musicVolume;
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
