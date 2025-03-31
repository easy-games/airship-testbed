import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";
import { SerializableAction } from "@Easy/Core/Shared/Input/InputAction";

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
	microphoneEnabled: boolean;
	coreKeybindOverrides: { [key in CoreAction]?: SerializableAction } | undefined;
	gameKeybindOverrides: { [key: string]: { [key: string]: SerializableAction } };
}
