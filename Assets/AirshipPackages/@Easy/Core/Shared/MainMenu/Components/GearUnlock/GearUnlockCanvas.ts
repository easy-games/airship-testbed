import { Game } from "@Easy/Core/Shared/Game";

export default class GearUnlockCanvas extends AirshipBehaviour {
	public titleText: TMP_Text;
	public messageText: TMP_Text;
	public rawImage: RawImage;
	public continueBtn: Button;
	public wrapper: RectTransform;
	public canvasGroup: CanvasGroup;

	override Start(): void {}

	public Init(gear: PlatformGear, title: string, message: string, renderTexture: RenderTexture): void {
		this.titleText.text = title;
		this.messageText.text = message;

		this.rawImage.texture = renderTexture;
		this.rawImage.enabled = true;

		if (this.canvasGroup) {
			this.canvasGroup.alpha = 0;
			NativeTween.CanvasGroupAlpha(this.canvasGroup, 1, 0.5).SetEaseQuadOut();
		}

		this.wrapper.anchoredPosition = new Vector2(0, -60);
		// Something is wrong with android safe area so we go extra high.
		if (Game.platform === AirshipPlatform.Android) {
			NativeTween.AnchoredPositionY(this.wrapper, 100, 0.5).SetEaseQuadOut();
		} else {
			NativeTween.AnchoredPositionY(this.wrapper, 30, 0.5).SetEaseQuadOut();
		}

		task.spawn(() => {
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			task.wait(0.2);
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			task.wait(0.2);
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			task.wait(0.2);
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			task.wait(0.2);
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			task.wait(0.2);
			VibrationManager.Play(VibrationFeedbackType.Heavy);
		});
	}

	override OnDestroy(): void {}
}
