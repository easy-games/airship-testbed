import { Game } from "@Easy/Core/Shared/Game";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class FriendCard extends AirshipBehaviour {
	public redirectScroll: AirshipRedirectScroll;
	public bubbler: UIScrollRectEventBubbler;

	@NonSerialized() public canvas?: Canvas;
	@HideInInspector()
	public friendId!: string;
	private rectTransform!: RectTransform;

	public Awake(): void {
		let canvasTransform: Transform | undefined = this.transform;
		while (!this.canvas) {
			canvasTransform = canvasTransform.parent;
			if (!canvasTransform) break; // Couldn't find a canvas parent

			this.canvas = canvasTransform?.GetComponent<Canvas>();
		}
		const canvasScaleFactor = this.canvas?.scaleFactor ?? 1;
		this.rectTransform = this.transform.GetComponent<RectTransform>();

		if (Game.IsMobile()) {
			this.redirectScroll.enabled = true;
			this.bubbler.enabled = true;
		}

		let cloneObject: GameObject | undefined;
		let cloneRect: RectTransform | undefined;
		if (!Game.IsMobile()) {
			CanvasAPI.OnBeginDragEvent(this.gameObject, (data) => {
				cloneObject = Object.Instantiate(
					this.gameObject,
					this.transform.parent!.parent!.parent?.parent?.parent!,
				);
				cloneRect = cloneObject.GetComponent<RectTransform>()!;

				const image = cloneObject.GetComponent<Image>();
				if (image) {
					// Make image not block raycast (for detecting what we're hovering behind)
					image.raycastTarget = false;
				}
				const button = cloneObject.GetComponent<Button>();
				if (button) {
					// Keep image background
					button.colors.normalColor = new Color(0, 0, 0, 161 / 255);
				}

				cloneRect.sizeDelta = new Vector2(
					this.rectTransform.rect.width,
					(cloneRect!.rect.height = this.rectTransform.rect.height),
				);
				cloneRect.position = this.rectTransform.position;
			});

			CanvasAPI.OnDragEvent(this.gameObject, (data) => {
				if (!cloneRect) return;

				cloneRect!.anchoredPosition = cloneRect!.anchoredPosition.add(data.delta.div(canvasScaleFactor));
			});

			CanvasAPI.OnEndDragEvent(this.gameObject, () => {
				if (cloneObject) {
					Object.Destroy(cloneObject);
					cloneObject = undefined;
					cloneRect = undefined;
				}
			});
		}
	}
}
