export interface ClientSettingsFile {
	mouseSensitivity: number;
	mouseSmoothing: number;
	touchSensitivity: number;
	globalVolume: number;
	ambientVolume: number;
	musicVolume: number;
	screenshotShowUI: boolean;
	screenshotRenderHD: boolean;
	statusText: string;
	micDeviceName: string | undefined;
}
