import { Game } from "../../Game";

enum SafeAreaOrientation {
	PortraitAndLandscape,
	Portrait,
	Landscape,
}

enum SafeAreaPlatform {
	iOS = 1 << 0,
	Android = 1 << 1,
	All = -1,
}

enum SafeAreaAxis {
	HorizontalAndVertical,
	Horizontal,
	Vertical,
}

@RequireComponent<RectTransform>()
export default class AirshipScreenSafeArea extends AirshipBehaviour {
	public safeArea: RectTransform;
	private safeAreaRect: Rect;
	private minAnchor: Vector2;
	private maxAnchor: Vector2;

	@SerializeField() protected orientation: SafeAreaOrientation = SafeAreaOrientation.PortraitAndLandscape;
	@SerializeField() protected platforms = SafeAreaPlatform.All;

	@SerializeField() protected axis = SafeAreaAxis.HorizontalAndVertical;

	protected Start(): void {
		this.safeArea ??= this.gameObject.GetComponent<RectTransform>()!;
	}

	protected OnEnable(): void {
		task.defer(() => this.UpdateSafeArea());
	}

	protected UpdateSafeArea() {
		if (!Game.IsMobile()) return;

		const platform = Game.platform;
		switch (platform) {
			case AirshipPlatform.Android: {
				if ((this.platforms & SafeAreaPlatform.Android) === 0) {
					this.enabled = false;
					return;
				}
				break;
			}
			case AirshipPlatform.iOS: {
				if ((this.platforms & SafeAreaPlatform.iOS) === 0) {
					this.enabled = false;
					return;
				}
				break;
			}
			default:
				this.enabled = false;
				break;
		}

		if (Game.deviceType === AirshipDeviceType.Tablet) return;

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

		if (this.axis === SafeAreaAxis.HorizontalAndVertical) {
			this.minAnchor = new Vector2(this.minAnchor.x / Screen.width, this.minAnchor.y / Screen.height);
			this.maxAnchor = new Vector2(this.maxAnchor.x / Screen.width, this.maxAnchor.y / Screen.height);
		} else if (this.axis === SafeAreaAxis.Horizontal) {
			this.minAnchor = new Vector2(this.minAnchor.x / Screen.width, 0);
			this.maxAnchor = new Vector2(this.maxAnchor.x / Screen.width, 1);
		} else if (this.axis === SafeAreaAxis.Vertical) {
			this.minAnchor = new Vector2(0, this.minAnchor.y / Screen.height);
			this.maxAnchor = new Vector2(1, this.maxAnchor.y / Screen.height);
		}

		this.safeArea.anchorMin = this.minAnchor;
		this.safeArea.anchorMax = this.maxAnchor;
	}

	protected Update(): void {
		if (Screen.safeArea !== this.safeAreaRect) this.UpdateSafeArea();
	}
}
