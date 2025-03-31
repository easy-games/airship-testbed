import { Protected } from "@Easy/Core/Shared/Protected";
import AirshipToggle from "../../AirshipToggle";
import MicDevice from "./MicDevice";

export default class MicrophoneSettingsPage extends AirshipBehaviour {
	@Header("References")
	public content!: RectTransform;
	public voiceChatToggle!: AirshipToggle;

	override OnEnable(): void {
		this.content.gameObject.ClearChildren();

		const currentDeviceIndex = Bridge.GetCurrentMicDeviceIndex();
		const deviceNames = Bridge.GetMicDevices();
		for (const i of $range(0, deviceNames.size() - 1)) {
			const deviceName = deviceNames[i];
			const btnGo = Object.Instantiate(
				AssetBridge.Instance.LoadAsset(
					"Assets/AirshipPackages/@Easy/Core/Prefabs/MainMenu/SettingsPage/MicDevice.prefab",
				),
				this.content,
			);
			const micDeviceComponent = btnGo.GetAirshipComponent<MicDevice>()!;
			micDeviceComponent.Init(i, deviceName, () => {
				this.SelectMicIndex(i, deviceName);
			});
			micDeviceComponent.SetSelected(currentDeviceIndex === i);
		}

		const clientSettings = Protected.Settings;
		task.spawn(() => {
			const permission = Bridge.HasMicrophonePermission() && clientSettings.data.microphoneEnabled;
			this.voiceChatToggle.SetValue(permission, true);
		});
		this.voiceChatToggle.onValueChanged.Connect((val) => {
			task.spawn(() => {
				if (val) {
					if (Bridge.HasMicrophonePermission()) {
						clientSettings.PickMicAndStartRecording();
						clientSettings.SetMicrophoneEnabled(true);
						clientSettings.MarkAsDirty();
					} else {
						Bridge.RequestMicrophonePermissionAsync();
						if (!Bridge.HasMicrophonePermission()) {
							// we prompted and user selected "no"
							this.voiceChatToggle.SetValue(false);
							return;
						}
						// user said "yes"
						clientSettings.SetMicrophoneEnabled(true);
						clientSettings.MarkAsDirty();
					}
				} else {
					clientSettings.SetMicrophoneEnabled(false);
					clientSettings.MarkAsDirty();
				}
			});
		});
	}

	public SelectMicIndex(deviceIndex: number, deviceName: string): void {
		if (!Bridge.HasMicrophonePermission()) {
			Bridge.RequestMicrophonePermissionAsync();
		}

		Bridge.StopMicRecording();
		Bridge.SetMicDeviceIndex(deviceIndex);

		const clientSettings = Protected.Settings;
		clientSettings.data.micDeviceName = deviceName;
		clientSettings.MarkAsDirty();

		if (!Bridge.IsMicRecording()) {
			clientSettings.StartMicRecording();
		}
		for (let i = 0; i < this.content.childCount; i++) {
			const go = this.content.GetChild(i);
			const deviceComponent = go.gameObject.GetAirshipComponent<MicDevice>();
			deviceComponent?.SetSelected(i === deviceIndex);
		}
	}

	override OnDisable(): void {}
}
