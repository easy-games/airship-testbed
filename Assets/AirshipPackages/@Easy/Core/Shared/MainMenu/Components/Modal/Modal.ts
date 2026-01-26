import { Asset } from "@Easy/Core/Shared/Asset";
import { Game } from "@Easy/Core/Shared/Game";

export default class Modal extends AirshipBehaviour {
	@Tooltip("Will set vertical padding of Vertical Layout Group on mobile if true.")
	public autoSetVerticalPadding = true;

	@Tooltip("Hidden on mobile")
	public bottomBar?: GameObject;

	@Tooltip("Hidden on mobile")
	public topRightCloseBtn?: GameObject;

	override Start(): void {
		const rect = this.transform as RectTransform;
		rect.anchoredPosition = Vector2.zero;

		const canvas = this.gameObject.GetComponentInParent<Canvas>()!;
		if (Game.IsPortrait()) {
			rect.localScale = Vector3.one;
			rect.sizeDelta = new Vector2(Screen.width / canvas.scaleFactor, Screen.height / canvas.scaleFactor);

			rect.anchoredPosition = rect.anchoredPosition.WithY(-rect.sizeDelta.y);
			NativeTween.AnchoredPositionY(rect, 0, 0.3).SetEaseQuadOut();

			this.bottomBar?.SetActive(false);
			this.topRightCloseBtn?.SetActive(false);

			Instantiate(
				Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/Modals/ModalMobileCloseBtn.prefab"),
				this.transform,
			);
		} else {
			if (Game.deviceType === AirshipDeviceType.Phone) {
				rect.sizeDelta = new Vector2(
					math.min(Screen.width / canvas.scaleFactor - 300, 600),
					Screen.height / canvas.scaleFactor - 100,
				);
				this.bottomBar?.SetActive(false);
			}

			rect.localScale = Vector3.one.mul(0.4);
			NativeTween.LocalScale(rect, Vector3.one, 0.12).SetEaseQuadOut().SetUseUnscaledTime(true);
		}
	}

	public OnEnable(): void {
		// We run this logic always in portrait, and always on phones in landscape. So always on phones..
		if (Game.deviceType === AirshipDeviceType.Phone) {
			const contentSizeFitter = this.gameObject.GetComponentInChildren<ContentSizeFitter>();
			if (contentSizeFitter) {
				contentSizeFitter.enabled = false;
				// contentSizeFitter.verticalFit = FitMode.Unconstrained;
			}

			if (this.autoSetVerticalPadding) {
				const vlg = this.gameObject.GetComponent<VerticalLayoutGroup>();
				if (vlg) {
					let safeAreaTopPadding = Screen.height - (Screen.safeArea.y + Screen.safeArea.height);
					safeAreaTopPadding /= Game.GetScaleFactor();
					vlg.padding.top = safeAreaTopPadding;

					vlg.padding.bottom = Screen.safeArea.y / Game.GetScaleFactor();
				}
			}
		}
	}

	override OnDestroy(): void {}
}
