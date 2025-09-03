import { Game } from "../../Game";

enum SafeAreaOrientation {
	PortraitAndLandscape,
	Portrait,
	Landscape,
}

@RequireComponent<RectTransform>()
export default class AirshipScreenSafeArea extends AirshipBehaviour {
	public safeArea: RectTransform;
	private safeAreaRect: Rect;
	private minAnchor: Vector2;
	private maxAnchor: Vector2;

	public orientation: SafeAreaOrientation = SafeAreaOrientation.PortraitAndLandscape;

	protected Start(): void {
		this.safeArea ??= this.gameObject.GetComponent<RectTransform>()!;
	}

	protected OnEnable(): void {
		task.defer(() => this.UpdateSafeArea());
	}

	protected UpdateSafeArea() {
		let shouldModify: boolean;
		if (this.orientation === SafeAreaOrientation.PortraitAndLandscape) {
			shouldModify = true;
		} else if (this.orientation === SafeAreaOrientation.Landscape) {
			shouldModify = Game.IsLandscape();
		} else {
			shouldModify = !Game.IsLandscape();
		}

		if (!shouldModify) return;

		this.safeAreaRect = Screen.safeArea;

		this.minAnchor = this.safeAreaRect.position;
		this.maxAnchor = this.minAnchor.add(this.safeAreaRect.size);

		this.minAnchor = new Vector2(this.minAnchor.x / Screen.width, this.minAnchor.y / Screen.height);
		this.maxAnchor = new Vector2(this.maxAnchor.x / Screen.width, this.maxAnchor.y / Screen.height);

		this.safeArea.anchorMin = this.minAnchor;
		this.safeArea.anchorMax = this.maxAnchor;
	}

	protected Update(): void {
		if (Screen.safeArea !== this.safeAreaRect) this.UpdateSafeArea();
	}
}
