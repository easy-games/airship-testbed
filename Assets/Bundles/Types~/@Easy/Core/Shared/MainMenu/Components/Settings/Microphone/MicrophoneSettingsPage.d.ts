/// <reference types="compiler-types" />
export default class MicrophoneSettingsPage extends AirshipBehaviour {
    content: RectTransform;
    OnEnable(): void;
    SelectMicIndex(deviceIndex: number, deviceName: string): void;
    OnDisable(): void;
}
