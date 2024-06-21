export default class Modal extends AirshipBehaviour {
	override Start(): void {}

	public OnEnable(): void {
		const rect = this.transform as RectTransform;
		rect.localScale = Vector3.one.mul(0.4);
		rect.TweenLocalScale(Vector3.one, 0.12);
	}

	override OnDestroy(): void {}
}
