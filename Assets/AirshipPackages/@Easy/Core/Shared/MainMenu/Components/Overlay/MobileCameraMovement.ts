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
	private cameraDragFromRegisteredTouch = false;

	protected Awake(): void {
		this.image = this.gameObject.GetComponent<Image>()!;
	}

	protected override OnEnable(): void {
		this.image.enabled = true;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnBeginDragEvent(this.gameObject, (data) => {
				this.cameraDragFromRegisteredTouch = false;
				const camSystem = Dependency<AirshipCameraSingleton>().cameraSystem;
				if (!camSystem) return;
				const camMode = camSystem.GetMode();

				this.touchPointerId = data.pointerId;
				this.touchStartPos = data.position;
				this.touchStartRotX = camMode.rotationX;
				this.touchStartRotY = camMode.rotationY;
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
	}

	protected LateUpdate(dt: number): void {
		if (!this.cameraDragFromRegisteredTouch || this.touchPointerId < 0) {
			return;
		}

		for (let i = 0; i < Input.touchCount; i++) {
			const t = Input.GetTouch(i);
			if (t.fingerId !== this.touchPointerId) {
				continue;
			}
			if (t.phase === TouchPhase.Ended || t.phase === TouchPhase.Canceled) {
				this.touchPointerId = -1;
				this.cameraDragFromRegisteredTouch = false;
				return;
			}
			if (t.phase === TouchPhase.Moved || t.phase === TouchPhase.Stationary) {
				const pos = new Vector2(t.position.x, t.position.y);
				this.ApplyDragFromScreenPosition(pos);
			}
			return;
		}

		this.touchPointerId = -1;
		this.cameraDragFromRegisteredTouch = false;
	}

	public SetActive(active: boolean) {
		this.gameObject.SetActive(active);
	}

	/**
	 * Use when we want a finger to continue to rotate the camera after a second camera drag happens.
	 * This will be auto unregistered when the touch ends or is cancelled as well.
	 */
	public RegisterCameraDragFromTouchId(touchId: number): void {
		if (this.touchPointerId === touchId) {
			if (this.cameraDragFromRegisteredTouch) {
				let found = false;
				for (let i = 0; i < Input.touchCount; i++) {
					const t = Input.GetTouch(i);
					if (t.fingerId !== touchId) {
						continue;
					}
					found = true;
					if (t.phase === TouchPhase.Ended || t.phase === TouchPhase.Canceled) {
						this.ClearRegisteredCameraDragForTouchId(touchId);
					}
					break;
				}
				if (!found) {
					this.ClearRegisteredCameraDragForTouchId(touchId);
				}
			}
			return;
		}

		for (let i = 0; i < Input.touchCount; i++) {
			const t = Input.GetTouch(i);
			if (t.fingerId !== touchId) {
				continue;
			}
			if (t.phase === TouchPhase.Ended || t.phase === TouchPhase.Canceled) {
				this.ClearRegisteredCameraDragForTouchId(touchId);
				return;
			}

			const camSystem = Dependency<AirshipCameraSingleton>().cameraSystem;
			if (!camSystem) {
				return;
			}
			const camMode = camSystem.GetMode();
			this.touchPointerId = touchId;
			this.touchStartPos = new Vector2(t.position.x, t.position.y);
			this.touchStartRotX = camMode.rotationX;
			this.touchStartRotY = camMode.rotationY;
			this.cameraDragFromRegisteredTouch = true;
			return;
		}
	}

	/** Immediately stops the registered camera drag for this touch id. */
	public ClearRegisteredCameraDragForTouchId(touchId: number): void {
		if (this.cameraDragFromRegisteredTouch && this.touchPointerId === touchId) {
			this.touchPointerId = -1;
			this.cameraDragFromRegisteredTouch = false;
		}
	}

	public BeginDragEvent(data: PointerEventData) {
		this.cameraDragFromRegisteredTouch = false;
		const camSystem = Dependency<AirshipCameraSingleton>().cameraSystem;
		if (!camSystem) return;
		const camMode = camSystem.GetMode();

		this.touchPointerId = data.pointerId;
		this.touchStartPos = data.position;
		this.touchStartRotX = camMode.rotationX;
		this.touchStartRotY = camMode.rotationY;
	}

	public DragEvent(data: PointerEventData) {
		if (this.cameraDragFromRegisteredTouch) {
			return;
		}
		if (this.touchPointerId !== data.pointerId) return;

		this.ApplyDragFromScreenPosition(data.position);
	}

	public EndDragEvent(pointerId: number) {
		if (this.touchPointerId === pointerId) {
			this.touchPointerId = -1;
			this.cameraDragFromRegisteredTouch = false;
		}
	}

	public CancelDrag(): void {
		this.touchPointerId = -1;
		this.cameraDragFromRegisteredTouch = false;
	}

	public GetTouchPointerId(): number {
		return this.touchPointerId;
	}

	private ApplyDragFromScreenPosition(screenPosition: Vector2): void {
		const camSystem = Dependency<AirshipCameraSingleton>().cameraSystem;
		if (!camSystem) return;
		const camMode = camSystem.GetMode();

		const deltaPosSinceStart = screenPosition.sub(this.touchStartPos);
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
}
