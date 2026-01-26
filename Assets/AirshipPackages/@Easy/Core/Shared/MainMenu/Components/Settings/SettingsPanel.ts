export default class SettingsPanel extends AirshipBehaviour {
	override Start(): void {
		// if (Game.deviceType !== AirshipDeviceType.Phone) {
		// 	const img = this.gameObject.GetComponent<Image>();
		// 	if (img) {
		// 		img.enabled = false;
		// 	}
		// 	const verticalLayoutGroup = this.gameObject.GetComponent<VerticalLayoutGroup>();
		// 	if (verticalLayoutGroup) {
		// 		verticalLayoutGroup.padding = new RectOffset();
		// 	}
		// }
	}

	override OnDestroy(): void {}
}
