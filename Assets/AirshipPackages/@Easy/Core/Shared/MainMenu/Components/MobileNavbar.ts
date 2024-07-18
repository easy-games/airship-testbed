export default class MobileNavbar extends AirshipBehaviour {
	override Start(): void {
		const rect = this.transform as RectTransform;
		rect.offsetMax = new Vector2(0, Screen.safeArea.yMin / 2 + 65);
	}

	override OnDestroy(): void {}
}
