/// <reference types="compiler-types" />
export default class MicDevice extends AirshipBehaviour {
    bgImage: Image;
    text: TMP_Text;
    private micIndex;
    private bin;
    private selectCallback?;
    Init(micIndex: number, deviceName: string, selectCallback: () => void): void;
    SetSelected(selected: boolean): void;
    OnEnable(): void;
    OnDisable(): void;
}
