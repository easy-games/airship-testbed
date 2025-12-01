import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";
import { SerializableAction } from "@Easy/Core/Shared/Input/InputAction";

export interface ClientSettingsFile {
	sprintToggleEnabled: boolean;
	mouseSensitivity: number;
	mouseSmoothing: number;
	touchSensitivity: number;
	mobileDynamicJoystick: boolean;
	globalVolume: number;
	ambientVolume: number;
	musicVolume: number;
	screenshotShowUI: boolean;
	screenshotRenderHD: boolean;
	statusText: string;
	micDeviceName: string | undefined;
	microphoneEnabled: boolean;
	voiceToggleEnabled: boolean;
	vsync: boolean;
	shadowLevel: number;
	msaaSamples: number;
	limitFps: number;
	coreKeybindOverrides: { [key in CoreAction]?: SerializableAction } | undefined;
	gameKeybindOverrides: { [key: string]: { [key: string]: SerializableAction } };
}
