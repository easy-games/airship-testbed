import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class ModalMobileCloseBtn extends AirshipBehaviour {
	public button: Button;
	private bin = new Bin();

	override Start(): void {
		const rect = this.transform as RectTransform;
		const canvas = this.gameObject.GetComponentInParent<Canvas>()!;
		rect.anchoredPosition = rect.anchoredPosition.WithY(Screen.safeArea.y / canvas.scaleFactor + 30);

		this.button.onClick.Connect(() => {
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			AppManager.Close();
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
