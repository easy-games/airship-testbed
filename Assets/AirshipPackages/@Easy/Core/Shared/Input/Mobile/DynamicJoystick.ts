import { Airship } from "../../Airship";
import MobileCameraMovement from "../../MainMenu/Components/Overlay/MobileCameraMovement";
import { Bin } from "../../Util/Bin";
import { CanvasAPI } from "../../Util/CanvasAPI";

export default class DynamicJoystick extends AirshipBehaviour {
	@SerializeField() private dragTarget: RectTransform;
	@SerializeField() private handleOuter: RectTransform;
	@SerializeField() private handleInner: RectTransform;
	@SerializeField() private handleOuterOutline: Image;
	@NonSerialized() public input = new Vector2(0, 0);
	public handleRange = 1;
	public deadZone = 0;

	private dragging = false;
	private joystickTouchId = -1;
	private handleInnerImage: Image;
	private handleOuterImage: Image;
	private canvas!: Canvas;
	private bin = new Bin();
	private mobileCameraMovement: MobileCameraMovement | undefined;

	public Awake(): void {
		this.handleInnerImage = this.handleInner.GetComponent<Image>()!;
		this.handleOuterImage = this.handleOuter.GetComponent<Image>()!;
		this.canvas = this.gameObject.GetComponentInParent<Canvas>()!;
		this.mobileCameraMovement = Airship.Input.GetMobileCameraMovement();

		if (this.canvas === undefined) {
			error("TouchJoystick must be placed inside of a canvas.");
		}
	}

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.dragTarget.gameObject, (data) => {
				if (!this.dragging) {
					// First touch starts the joystick
					this.joystickTouchId = data.pointerId;
					const localPosition = Bridge.ScreenPointToLocalPointInRectangle(this.dragTarget, data.position);
					this.handleOuter.anchoredPosition = localPosition;
					NativeTween.GraphicAlpha(this.handleOuterImage, 0.6, 0.2).SetUseUnscaledTime(true);
					NativeTween.GraphicAlpha(this.handleInnerImage, 0.7, 0.2).SetUseUnscaledTime(true);
					NativeTween.GraphicAlpha(this.handleOuterOutline, 0.4, 0.2).SetUseUnscaledTime(true);
					this.dragging = true;
					this.HandleDrag(data.position);
				} else {
					// Additional touches while joystick is active go to camera movement
					this.mobileCameraMovement?.BeginDragEvent(data);
				}
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.dragTarget.gameObject, (data) => {
				if (this.dragging && this.joystickTouchId === data.pointerId) {
					this.HandleDrag(data.position);
				} else {
					this.mobileCameraMovement?.DragEvent(data);
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnEndDragEvent(this.dragTarget.gameObject, (data) => {
				this.mobileCameraMovement?.EndDragEvent(data.pointerId);

				// Only end joystick if this was the joystick touch
				if (this.joystickTouchId === data.pointerId) {
					this.StopDrag(false);
				}
			}),
		);
	}

	private StopDrag(instant: boolean) {
		if (instant) {
			this.handleInner.anchoredPosition = Vector2.zero;
			this.handleOuterImage.color.a = 0;
			this.handleInnerImage.color.a = 0;
			this.handleOuterOutline.color.a = 0;
		} else {
			NativeTween.AnchoredPosition(this.handleInner, Vector2.zero, 0.1).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.handleOuterImage, 0, 0.2).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.handleInnerImage, 0, 0.2).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.handleOuterOutline, 0, 0.2).SetUseUnscaledTime(true);
		}
		this.input = Vector2.zero;
		this.dragging = false;
		this.joystickTouchId = -1;
	}

	public SetRaycastPadding(padding: Vector4): void {
		const img = this.dragTarget.GetComponent<Image>()!;
		img.raycastPadding = padding;
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
		if (!active && this.dragging) {
			this.StopDrag(true);
		}
		this.gameObject.SetActive(active);
	}

	override OnDestroy(): void {}
}
