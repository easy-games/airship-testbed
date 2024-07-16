import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class ConfirmModal extends AirshipBehaviour {
	public title: TMP_Text;
	public message: TMP_Text;

	public confirmButton: Button;
	public onResult = new Signal<boolean>();
	private sentResult = false;

	override Start(): void {
		CanvasAPI.OnClickEvent(this.confirmButton.gameObject, () => {
			this.sentResult = true;
			AppManager.Close();
			this.onResult.Fire(true);
		});
	}

	override OnDestroy(): void {
		if (this.sentResult) return;
		this.onResult.Fire(false);
	}
}
