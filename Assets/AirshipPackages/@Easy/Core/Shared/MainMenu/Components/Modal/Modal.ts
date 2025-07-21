import { Game } from "@Easy/Core/Shared/Game";

export default class Modal extends AirshipBehaviour {
	override Start(): void {}

	public OnEnable(): void {
		const rect = this.transform as RectTransform;
		rect.localScale = Vector3.one.mul(0.4);

		if (Game.IsMobile()) {
			NativeTween.LocalScale(rect, Vector3.one.mul(2), 0.12).SetUseUnscaledTime(true);
		} else {
			NativeTween.LocalScale(rect, Vector3.one, 0.12).SetUseUnscaledTime(true);
		}
	}

	override OnDestroy(): void {}
}
