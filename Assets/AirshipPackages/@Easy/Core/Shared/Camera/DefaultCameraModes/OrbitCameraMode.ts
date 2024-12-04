import { Airship } from "@Easy/Core/Shared/Airship";
import { ControlScheme, Mouse, Preferred, Touchscreen } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ObjectUtils from "../../Util/ObjectUtils";
import { CameraConstants, OrbitCameraConfig } from "../CameraConstants";
import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";
import { OcclusionCameraManager } from "../OcclusionCameraManager";

const TAU = math.pi * 2;

export class OrbitCameraMode extends CameraMode {
	GetFriendlyName(): string {
		return "Orbit Camera Mode";
	}

	private config: OrbitCameraConfig;
	public OnStopBin = new Bin();

	private radius = 4;
	private yOffset = 1.85;

	private occlusionCam!: OcclusionCam;

	private locked = false;
	private lastAttachToPos = Vector3.zero;

	public cameraForwardVector = Vector3.zero;

	private minRotX = math.rad(1);
	private maxRotX = math.rad(179);

	private mouseLocked = false;
	private mouseLockSwapped = false;
	private mouseSmoothingEnabled = true;
	private smoothVector = new Vector2(0, 0);

	private readonly preferred = this.OnStopBin.Add(new Preferred());
	private readonly touchscreen = this.OnStopBin.Add(new Touchscreen());

	constructor(target: GameObject, config?: OrbitCameraConfig) {
		super(target);
		this.Init(config ?? CameraConstants.DefaultOrbitCameraConfig);
		this.SetupMobileControls();
	}

	private Init(config: OrbitCameraConfig): void {
		// Set all of the values from provided config. We fallback to our defaults, which are optimized for
		// the default Airship character.
		this.config = ObjectUtils.deepCopy(config);
		this.SetRadius(this.config.radius ?? CameraConstants.DefaultOrbitCameraConfig.radius);
		this.SetYOffset(this.config.yOffset ?? CameraConstants.DefaultOrbitCameraConfig.yOffset);
		this.SetMinRotX(this.config.minRotX ?? CameraConstants.DefaultOrbitCameraConfig.minRotX);
		this.SetMaxRotX(this.config.maxRotX ?? CameraConstants.DefaultOrbitCameraConfig.maxRotX);
		this.OnEnabled();
	}

	public OnEnabled(): void {
		// This enables our character specific behavior for the default Airship character.
		// TODO: Maybe we move this out of here and add a signal that fires when the camera mode
		// is changed?
		let characterLogicBin: Bin | undefined;
		if (this.character && this.character.IsLocalCharacter()) {
			characterLogicBin = Airship.Camera.ManageOrbitCameraForLocalCharacter(this, this.character);
			this.OnStopBin.Add(() => characterLogicBin!.Clean());
		}
		this.OnStopBin.Add(
			this.onTargetChanged.Connect((event) => {
				if (characterLogicBin && !event.after.character?.IsLocalCharacter()) {
					characterLogicBin.Clean();
				}
				if (event.after.character?.IsLocalCharacter()) {
					characterLogicBin = Airship.Camera.ManageOrbitCameraForLocalCharacter(this, event.after.character);
					this.OnStopBin.Add(() => characterLogicBin!.Clean());
				}
			}),
		);
	}

	private SetupMobileControls() {
		const touchscreen = this.OnStopBin.Add(new Touchscreen());
		let touchStartPos = Vector3.zero;
		let touchStartRotX = 0;
		let touchStartRotY = 0;
		let touchOverUI = false;
		touchscreen.pan.Connect((position, phase) => {
			switch (phase) {
				case TouchPhase.Began:
					if (InputBridge.Instance.IsPointerOverUI()) {
						touchOverUI = true;
					} else {
						touchOverUI = false;
						touchStartPos = position;
						touchStartRotX = this.rotationX;
						touchStartRotY = this.rotationY;
					}
					break;
				case TouchPhase.Moved: {
					if (touchOverUI) break;
					const deltaPosSinceStart = position.sub(touchStartPos);
					this.rotationY =
						(touchStartRotY - deltaPosSinceStart.x * CameraConstants.SensitivityScalar) % (math.pi * 2);
					this.rotationX = math.clamp(
						touchStartRotX + deltaPosSinceStart.y * CameraConstants.SensitivityScalar,
						this.minRotX,
						this.maxRotX,
					);
					break;
				}
				case TouchPhase.Ended:
					touchOverUI = false;
					break;
				default:
					break;
			}
		});
	}

	OnStart(camera: Camera, rootTransform: Transform) {
		this.occlusionCam = rootTransform.GetComponent<OcclusionCam>()!;
		if (this.occlusionCam === undefined) {
			this.occlusionCam = rootTransform.gameObject.AddComponent<OcclusionCam>();
		}
		this.occlusionCam.Init(camera);

		this.OnStopBin.Add(this.preferred);
		this.OnStopBin.Add(this.touchscreen);

		// const mouseUnlocker = this.mouse.AddUnlocker();
		// this.bin.Add(() => this.mouse.RemoveUnlocker(mouseUnlocker));

		// if (!this.locked) {
		// 	this.cameraCleanup.Add(Mouse.AddUnlocker());
		// }

		this.OnStopBin.Add(
			Airship.Input.preferredControls.ObserveControlScheme((scheme) => {
				const controlSchemeBin = new Bin();
				if (scheme === ControlScheme.MouseKeyboard) {
					let rightClickUnlockerCleanup: (() => void) | undefined = Mouse.AddUnlocker();

					controlSchemeBin.Add(
						Mouse.onRightDown.Connect(() => {
							if (rightClickUnlockerCleanup === undefined) return;
							rightClickUnlockerCleanup();
							rightClickUnlockerCleanup = undefined;
						}),
					);

					controlSchemeBin.Add(
						Mouse.onRightUp.Connect(() => {
							if (rightClickUnlockerCleanup !== undefined) return;
							rightClickUnlockerCleanup = Mouse.AddUnlocker();
						}),
					);

					controlSchemeBin.Add(() => {
						if (rightClickUnlockerCleanup === undefined) return;
						rightClickUnlockerCleanup();
						rightClickUnlockerCleanup = undefined;
					});
				} else if (scheme === ControlScheme.Touch) {
					controlSchemeBin.Add(Mouse.AddUnlocker());
				}
				return () => {
					controlSchemeBin.Clean();
				};
			}),
		);
	}

	OnStop() {
		this.OnStopBin.Clean();
	}

	OnUpdate(dt: number) {
		const rightClick = Mouse.isRightDown;

		if (Mouse.IsLocked() && rightClick && !this.locked) {
			let mouseDelta = Mouse.GetDelta();
			// This is to prevent large jump on first movement (happens always on mac)
			if (this.mouseLockSwapped && mouseDelta.magnitude > 0) {
				this.mouseLockSwapped = false;
				mouseDelta = new Vector2(0, 0);
			}
			let moveDelta = mouseDelta;

			// Trying to do 1/MOUSE_SMOOTHING every 1/120th of a second (while supporting variable dt). Not sure if this math checks out.
			if (this.mouseSmoothingEnabled) {
				const smoothFactor = math.pow(1 / (1 + Airship.Input.GetMouseSmoothing()), Time.deltaTime * 120);
				this.smoothVector = new Vector2(
					math.lerp(this.smoothVector.x, mouseDelta.x, smoothFactor),
					math.lerp(this.smoothVector.y, mouseDelta.y, smoothFactor),
				);
				moveDelta = this.smoothVector;
			}

			const mouseSensitivity = Airship.Input.GetMouseSensitivity();

			this.rotationY =
				(this.rotationY -
					(mouseDelta.x / Screen.width) * mouseSensitivity * CameraConstants.SensitivityScalar) %
				(math.pi * 2);
			this.rotationX = math.clamp(
				this.rotationX + (moveDelta.y / Screen.width) * mouseSensitivity * CameraConstants.SensitivityScalar,
				this.minRotX,
				this.maxRotX,
			);
		}

		// Update mouse locked state. This will make the next frame's delta be 0.
		if (this.mouseLocked !== Mouse.IsLocked()) {
			this.mouseLocked = !this.mouseLocked;
			this.mouseLockSwapped = true;
		}
	}

	OnLateUpdate(dt: number) {
		const radius = this.radius;

		// Polar to cartesian conversion (i.e. the 3D point around the sphere of the character):
		const rotY = this.rotationY - math.pi / 2;
		const xPos = radius * math.cos(rotY) * math.sin(this.rotationX);
		const zPos = radius * math.sin(rotY) * math.sin(this.rotationX);
		const yPos = radius * math.cos(this.rotationX);

		const posOffset = new Vector3(xPos, yPos, zPos);
		const attachToPos = this.target?.transform.position.add(new Vector3(0, this.yOffset, 0)) ?? Vector3.zero;
		this.lastAttachToPos = attachToPos;

		let newPosition = attachToPos.add(posOffset);
		let rotation: Quaternion;

		let lv = posOffset.mul(-1).normalized;
		if (lv === Vector3.zero) {
			lv = new Vector3(0, 0, 0.01);
		}
		rotation = Quaternion.LookRotation(lv, Vector3.up);

		return new CameraTransform(newPosition, rotation);
	}

	OnPostUpdate(cameraHolder: Transform) {
		cameraHolder.LookAt(this.lastAttachToPos);
		this.occlusionCam.BumpForOcclusion(this.lastAttachToPos, OcclusionCameraManager.GetMask());

		this.cameraForwardVector = cameraHolder.forward;
	}

	/**
	 * Bulk updates camera properties.
	 *
	 * @param properties `OrbitCamera` properties.
	 */
	public UpdateProperties(properties: Partial<OrbitCameraConfig>): void {
		if (properties.radius) this.SetRadius(properties.radius);
		if (properties.yOffset) this.SetYOffset(properties.yOffset);
		if (properties.minRotX) this.SetMinRotX(properties.minRotX);
		if (properties.maxRotX) this.SetMaxRotX(properties.maxRotX);
	}

	/**
	 * Sets camera's radius.
	 *
	 * @param xOffset The camera's new radius.
	 */
	public SetRadius(radius: number): void {
		this.radius = radius;
	}

	/**
	 * Gets camera's radius.
	 *
	 * @returns The camera's radius.
	 */
	public GetRadius(): number {
		return this.radius;
	}

	/**
	 * Sets camera's `y` offset.
	 *
	 * @param yOffset The camera's new `y` offset.
	 */

	public SetYOffset(yOffset: number): void {
		this.yOffset = yOffset;
	}

	/**
	 * Returns the camera's `y` offset.
	 *
	 * @returns The camera's **current** `y` offset.
	 */
	public GetYOffset(): number {
		return this.yOffset;
	}

	/**
	 * Sets the camera's minimum `x` rotation angle. This is how far **down** the camera can look.
	 *
	 * @param minX The minimum `x` rotation angle in **degrees**.
	 */
	public SetMinRotX(minX: number): void {
		this.minRotX = math.rad(minX);
	}

	/**
	 * Returns the camera's minimum `x` rotation angle in **degrees**.
	 *
	 * @returns The camera's minimum `x` rotation angle in **degrees**.
	 */
	public GetMinRotX(): number {
		return this.minRotX;
	}

	/**
	 * Sets the camera's maximum `x` rotation angle. This is how far **up** the camera can look.
	 *
	 * @param minX The maximum `x` rotation angle in **degrees**.
	 */
	public SetMaxRotX(maxX: number): void {
		this.maxRotX = math.rad(maxX);
	}

	/**
	 * Returns the camera's maximum `x` rotation angle in **degrees**.
	 *
	 * @returns The camera's maximu, `x` rotation angle in **degrees**.
	 */
	public GetMaxRotX(): number {
		return this.maxRotX;
	}

	/**
	 * Explicitly set the direction of the camera on the Y-axis based on the given directional vector.
	 */
	public SetYAxisDirection(direction: Vector3): void {
		direction = direction.normalized;
		this.rotationY = math.atan2(-direction.x, direction.z) % TAU;
	}

	/**
	 * Sets this camera to the provided `direction` vector.
	 *
	 * @param direction The direction to set this camera to.
	 */
	public SetDirection(direction: Vector3): void {
		direction = direction.normalized;
		this.rotationY = math.atan2(-direction.x, direction.z) % TAU;
		const adj = new Vector2(direction.x, direction.z).magnitude;
		this.rotationX = math.clamp(math.pi / 2 + math.atan2(direction.y, adj), this.minRotX, this.maxRotX);
	}

	/**
	 * Returns whether or not this camera is locked.
	 *
	 * @returns Whether or not this camera is locked.
	 */
	public GetLocked(): boolean {
		return this.locked;
	}

	/**
	 * Sets the camera's lock state to `locked`. When a camera is locked,
	 * it's rotation does not update in response to mouse or touch events.
	 *
	 * @param locked Whether or not camera should be locked.
	 */
	public SetLocked(locked: boolean): void {
		this.locked = locked;
	}
}
