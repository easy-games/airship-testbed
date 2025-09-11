import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class TouchJoystick extends AirshipBehaviour {
	@SerializeField() private dragTarget: RectTransform;
	@SerializeField() private handleOuter: RectTransform;
	@SerializeField() private handleInner: RectTransform;
	@SerializeField() private handleOuterOutline: Image;
	@SerializeField() private handleRange = 1;
	@SerializeField() private deadZone = 0;
	private handleOuterImage: Image;
	private handleInnerImage: Image;

	/**
	 * Normalized input vector.
	 */
	@NonSerialized() public input = new Vector2(0, 0);

	/**
	 * True if currently being dragged.
	 */
	private dragging = false;

	private rectTransform!: RectTransform;
	private canvas!: Canvas;

	private bin = new Bin();
	private tweenBin = new Bin();

	public Awake(): void {
		this.handleOuterImage = this.handleOuter.GetComponent<Image>()!;
		this.handleInnerImage = this.handleInner.GetComponent<Image>()!;
		this.rectTransform = this.gameObject.GetComponent<RectTransform>()!;
		this.canvas = this.gameObject.GetComponentInParent<Canvas>()!;
		if (this.canvas === undefined) {
			error("TouchJoystick must be placed inside of a canvas.");
		}
	}

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.dragTarget.gameObject, (data) => {
				NativeTween.GraphicAlpha(this.handleOuterImage, 0.6, 0.2).SetUseUnscaledTime(true);
				NativeTween.GraphicAlpha(this.handleInnerImage, 0.6, 0.2).SetUseUnscaledTime(true);
				NativeTween.GraphicAlpha(this.handleOuterOutline, 0.4, 0.2).SetUseUnscaledTime(true);
				this.tweenBin.Clean();
				this.dragging = true;
				this.HandleDrag(data.position, "begin");
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.dragTarget.gameObject, (data) => {
				if (!this.dragging) return;
				this.HandleDrag(data.position, "move");
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnEndDragEvent(this.dragTarget.gameObject, (data) => {
				NativeTween.GraphicAlpha(this.handleOuterImage, 0.2, 0.2).SetUseUnscaledTime(true);
				NativeTween.GraphicAlpha(this.handleInnerImage, 0.2, 0.2).SetUseUnscaledTime(true);
				NativeTween.GraphicAlpha(this.handleOuterOutline, 0.2, 0.2).SetUseUnscaledTime(true);
				this.input = Vector2.zero;
				this.dragging = false;

				// todo: adjust speed by distance
				NativeTween.AnchoredPosition(this.handleInner, Vector2.zero, 0.1).SetUseUnscaledTime(true);
			}),
		);
	}

	public SetRaycastPadding(padding: Vector4): void {
		const img = this.dragTarget.GetComponent<Image>()!;
		img.raycastPadding = padding;
	}

	private HandleDrag(dragPosition: Vector2, phase: "begin" | "end" | "move") {
		let pos = new Vector2(this.rectTransform.position.x, this.rectTransform.position.y);
		let radius = this.rectTransform.sizeDelta.div(2);
		this.input = dragPosition.sub(pos).div(radius.mul(this.canvas.scaleFactor));
		this.input = this.ApplyDeadZoneToInput(this.input, this.deadZone);
		let newPos = this.input.mul(radius);
		newPos = newPos.mul(this.handleRange);
		this.handleInner.anchoredPosition = newPos;
	}

	private ApplyDeadZoneToInput(input: Vector2, deadZone: number): Vector2 {
		let magnitude = input.magnitude;
		if (magnitude > deadZone) {
			if (magnitude > 1) {
				return input.normalized;
			}
			return input;
		}
		return Vector2.zero;
	}

	public SetActive(active: boolean) {
		this.gameObject.SetActive(active);
	}

	override OnDestroy(): void {}
}
