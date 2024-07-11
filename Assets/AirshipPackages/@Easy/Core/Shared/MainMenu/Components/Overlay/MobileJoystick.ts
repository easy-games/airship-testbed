import { Airship } from "../../../Airship";
import { Bin } from "../../../Util/Bin";
import { CanvasAPI } from "../../../Util/CanvasAPI";

export default class MobileJoystick extends AirshipBehaviour {
	public handle!: RectTransform;
	public handleRange = 1;
	public deadZone = 0;
	public tweenToCenterSensitivity = 50;

	private input = new Vector2(0, 0);
	private dragging = false;

	private rectTransform!: RectTransform;
	private canvas!: Canvas;

	private bin = new Bin();
	private tweenBin = new Bin();

	public Awake(): void {
		this.rectTransform = this.gameObject.GetComponent<RectTransform>()!;
		this.canvas = this.gameObject.transform.parent!.GetComponent<Canvas>()!;
	}

	override Start(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.gameObject, (data) => {
				this.tweenBin.Clean();
				this.dragging = true;
				this.HandleDrag(data.position, "begin");
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.gameObject, (data) => {
				if (!this.dragging) return;
				this.HandleDrag(data.position, "move");
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnEndDragEvent(this.gameObject, (data) => {
				this.input = Vector2.zero;
				this.dragging = false;
				Airship.Characters.localCharacterManager.input?.SetQueuedMoveDirection(
					new Vector3(this.input.x, 0, this.input.y),
				);

				// todo: adjust speed by distance
				NativeTween.AnchoredPosition(this.handle, Vector2.zero, 0.09);
				// this.tweenBin.Add(() => {
				// 	if (tween) {
				// 		tween.Cancel();
				// 	}
				// });
			}),
		);
	}

	private HandleDrag(dragPosition: Vector2, phase: "begin" | "end" | "move") {
		let pos = new Vector2(this.rectTransform.position.x, this.rectTransform.position.y);
		let radius = this.rectTransform.sizeDelta.div(2);
		this.input = dragPosition.sub(pos).div(radius.mul(this.canvas.scaleFactor));
		this.input = this.ApplyDeadZoneToInput(this.input, this.deadZone);
		let newPos = this.input.mul(radius);
		newPos = newPos.mul(this.handleRange);
		this.handle.anchoredPosition = newPos;
		Airship.Characters.localCharacterManager.input?.SetQueuedMoveDirection(
			new Vector3(this.input.x, 0, this.input.y),
		);
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

	override OnDestroy(): void {}
}
