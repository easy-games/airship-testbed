import { ClientSettingsController } from "@Easy/Core/Client/ProtectedControllers/Settings/ClientSettingsController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import MicDevice from "./MicDevice";

export default class MicrophoneSettingsPage extends AirshipBehaviour {
	public content!: RectTransform;

	override OnEnable(): void {
		this.content.gameObject.ClearChildren();

		const currentDeviceIndex = Bridge.GetCurrentMicDeviceIndex();
		const deviceNames = Bridge.GetMicDevices();
		for (let i = 0; i < deviceNames.Length; i++) {
			const deviceName = deviceNames.GetValue(i);
			const btnGo = Object.Instantiate(
				AssetBridge.Instance.LoadAsset("@Easy/Core/Client/Resources/MainMenu/SettingsPage/MicDevice.prefab"),
				this.content,
			);
			const micDeviceComponent = btnGo.GetAirshipComponent<MicDevice>()!;
			micDeviceComponent.Init(i, deviceName, () => {
				this.SelectMicIndex(i, deviceName);
			});
			micDeviceComponent.SetSelected(currentDeviceIndex === i);
		}
	}

	public SelectMicIndex(deviceIndex: number, deviceName: string): void {
		if (!Bridge.HasMicrophonePermission()) {
			Bridge.RequestMicrophonePermissionAsync();
		}

		Bridge.StopMicRecording();
		Bridge.SetMicDeviceIndex(deviceIndex);

		const clientSettings = Dependency<ClientSettingsController>();
		clientSettings.data.micDeviceName = deviceName;
		clientSettings.MarkAsDirty();

		if (!Bridge.IsMicRecording()) {
			const clientSettings = Dependency<ClientSettingsController>();
			Bridge.StartMicRecording(clientSettings.micFrequency, clientSettings.micSampleLength);
		}
		for (let i = 0; i < this.content.childCount; i++) {
			const go = this.content.GetChild(i);
			const deviceComponent = go.gameObject.GetAirshipComponent<MicDevice>();
			deviceComponent?.SetSelected(i === deviceIndex);
		}
	}

	override OnDisable(): void {}
}
