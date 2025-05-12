import { GameCoordinatorTransfers } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

const client = new GameCoordinatorTransfers.Client(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class TransferToast extends AirshipBehaviour {
	public gameName: TMP_Text;
	public cancelButton: Button;
	public canvasGroup: CanvasGroup;

	private bin = new Bin();

	override Start(): void {
		this.canvasGroup.alpha = 0;
		const rect = this.transform as RectTransform;
		rect.anchoredPosition = new Vector2(rect.anchoredPosition.x, 0);

		NativeTween.CanvasGroupAlpha(this.canvasGroup, 1, 0.7).SetEaseQuadOut();
		NativeTween.AnchoredPositionY(rect, -86, 0.5).SetEaseBounceOut();

		this.bin.Add(
			this.cancelButton.onClick.Connect(() => {
				task.spawn(async () => {
					await client.cancelTransfer();
					if (this.gameObject.activeInHierarchy) {
						Object.Destroy(this.gameObject);
					}
				});
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
