import { Bin } from "../../Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "../../Util/CanvasAPI";

export default class DynamicJoystick extends AirshipBehaviour {
	@SerializeField() private dragTarget: RectTransform;
	@SerializeField() private handleOuter: RectTransform;
	@SerializeField() private handleInner: RectTransform;
	@SerializeField() private handleOuterOutline: Image;
	@NonSerialized() public input = new Vector2(0, 0);
	public handleRange = 1;
	public deadZone = 0;

	private dragging = false;
	private handleInnerImage: Image;
	private handleOuterImage: Image;
	private canvas!: Canvas;
	private bin = new Bin();
	private tweenBin = new Bin();

	public Awake(): void {
		this.handleInnerImage = this.handleInner.GetComponent<Image>()!;
		this.handleOuterImage = this.handleOuter.GetComponent<Image>()!;
		this.canvas = this.gameObject.GetComponentInParent<Canvas>()!;

		if (this.canvas === undefined) {
			error("TouchJoystick must be placed inside of a canvas.");
		}
	}

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.dragTarget.gameObject, (direction, button) => {
				if (direction === PointerDirection.DOWN && button === PointerButton.LEFT) {
					const touchPosition = this.GetCurrentTouchPosition();
					if (touchPosition) {
						const localPosition = Bridge.ScreenPointToLocalPointInRectangle(this.dragTarget, touchPosition);
						this.handleOuter.anchoredPosition = localPosition;
						NativeTween.GraphicAlpha(this.handleOuterImage, 0.6, 0.2).SetUseUnscaledTime(true);
						NativeTween.GraphicAlpha(this.handleInnerImage, 0.7, 0.2).SetUseUnscaledTime(true);
						NativeTween.GraphicAlpha(this.handleOuterOutline, 0.4, 0.2).SetUseUnscaledTime(true);
					}
				}
				if (direction === PointerDirection.UP) {
					NativeTween.AnchoredPosition(this.handleInner, Vector2.zero, 0.1).SetUseUnscaledTime(true);
					NativeTween.GraphicAlpha(this.handleOuterImage, 0, 0.2).SetUseUnscaledTime(true);
					NativeTween.GraphicAlpha(this.handleInnerImage, 0, 0.2).SetUseUnscaledTime(true);
					NativeTween.GraphicAlpha(this.handleOuterOutline, 0, 0.2).SetUseUnscaledTime(true);
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.dragTarget.gameObject, (data) => {
				this.tweenBin.Clean();
				this.dragging = true;
				this.HandleDrag(data.position);
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.dragTarget.gameObject, (data) => {
				if (!this.dragging) return;
				this.HandleDrag(data.position);
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnEndDragEvent(this.dragTarget.gameObject, (data) => {
				this.input = Vector2.zero;
				this.dragging = false;
			}),
		);
	}

	public SetRaycastPadding(padding: Vector4): void {
		const img = this.dragTarget.GetComponent<Image>()!;
		img.raycastPadding = padding;
	}

	private GetCurrentTouchPosition(): Vector2 | undefined {
		for (let i = 0; i < Input.touchCount; i++) {
			const touch = Input.GetTouch(i);
			// Get the latest touch which is the one that began
			if (touch.phase === TouchPhase.Began) {
				if (CanvasAPI.IsPointerOverTarget(this.dragTarget.gameObject)) {
					return new Vector2(touch.position.x, touch.position.y);
				}
			}
		}

		return new Vector2(Input.mousePosition.x, Input.mousePosition.y);
	}

	private HandleDrag(dragPosition: Vector2) {
		let pos = new Vector2(this.handleOuter.position.x, this.handleOuter.position.y);
		let radius = this.handleOuter.sizeDelta.div(2);
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
