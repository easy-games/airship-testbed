import { AirshipCameraSingleton } from "../../../Camera/AirshipCameraSingleton";
import { Dependency } from "../../../Flamework";
import { Bin } from "../../../Util/Bin";
import { CanvasAPI } from "../../../Util/CanvasAPI";

const MIN_ROT_X = math.rad(1);
const MAX_ROT_X = math.rad(179);
const TAU = math.pi * 2;
const SENS_SCALAR = 0.01;

export default class MobileCameraMovement extends AirshipBehaviour {
	private bin = new Bin();
	private touchStartPos = Vector2.zero;
	private touchStartRotX = 0;
	private touchStartRotY = 0;
	private touchPointerId = -1;
	private image: Image;

	protected Awake(): void {
		this.image = this.gameObject.GetComponent<Image>()!;
	}

	protected override OnEnable(): void {
		this.image.enabled = true;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.gameObject, (data) => {
				this.BeginDragEvent(data);
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.gameObject, (data) => {
				this.DragEvent(data);
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnEndDragEvent(this.gameObject, (data) => {
				this.EndDragEvent(data.pointerId);
			}),
		);
	}

	protected override OnDisable(): void {
		this.bin.Clean();
		this.image.enabled = false;
		this.touchPointerId = -1;
	}

	public SetActive(active: boolean) {
		this.gameObject.SetActive(active);
	}

	public BeginDragEvent(data: PointerEventData) {
		const camSystem = Dependency<AirshipCameraSingleton>().cameraSystem;
		if (!camSystem) return;
		if (this.touchPointerId >= 0 && this.touchPointerId !== data.pointerId) {
			return;
		}
		const camMode = camSystem.GetMode();

		this.touchPointerId = data.pointerId;
		this.touchStartPos = data.position;
		this.touchStartRotX = camMode.rotationX;
		this.touchStartRotY = camMode.rotationY;
	}

	public DragEvent(data: PointerEventData) {
		const camSystem = Dependency<AirshipCameraSingleton>().cameraSystem;
		if (!camSystem) return;
		const camMode = camSystem.GetMode();

		if (this.touchPointerId !== data.pointerId) return;

		const deltaPosSinceStart = data.position.sub(this.touchStartPos);
		const touchSensitivity = contextbridge.invoke<() => number>(
			"ClientSettings:GetTouchSensitivity",
			LuauContext.Protected,
		);
		camMode.rotationY = (this.touchStartRotY - deltaPosSinceStart.x * SENS_SCALAR * touchSensitivity) % TAU;
		camMode.rotationX = math.clamp(
			this.touchStartRotX + deltaPosSinceStart.y * SENS_SCALAR * touchSensitivity,
			MIN_ROT_X,
			MAX_ROT_X,
		);
	}

	public EndDragEvent(pointerId: number) {
		if (this.touchPointerId === pointerId) {
			this.touchPointerId = -1;
		}
	}

	public CancelDrag(): void {
		this.touchPointerId = -1;
	}

	public GetTouchPointerId(): number {
		return this.touchPointerId;
	}
}
