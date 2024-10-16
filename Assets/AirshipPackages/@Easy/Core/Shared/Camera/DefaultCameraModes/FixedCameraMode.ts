import { Airship } from "@Easy/Core/Shared/Airship";
import { ControlScheme, Mouse, Preferred, Touchscreen } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { CameraMode, CameraTransform } from "..";
import ObjectUtils from "../../Util/ObjectUtils";
import { CameraConstants, FixedCameraConfig } from "../CameraConstants";
import DefaultCameraMask from "../DefaultCameraMask";

const TAU = math.pi * 2;

export class FixedCameraMode extends CameraMode {
	GetFriendlyName(): string {
		return "Fixed Camera Mode";
	}

	private config: FixedCameraConfig;

	private readonly cameraCleanUp = new Bin();

	private occlusionCam!: OcclusionCam;

	public cameraForwardVector = Vector3.zero;
	private cameraRightVector = new Vector3(0, 0, 1);

	private lastCameraPos = new Vector3(0, 0, 0);

	private locked = false;

	private shouldBumpForOcclusion = true;

	private xOffset = 0;
	private yOffset = 0;
	private zOffset = 0;

	private staticOffset: Vector3 | undefined;

	private minRotX = math.rad(1);
	private maxRotX = math.rad(179);

	private readonly preferred = this.cameraCleanUp.Add(new Preferred());
	private readonly touchscreen = this.cameraCleanUp.Add(new Touchscreen());

	private mouseSmoothingEnabled = true;
	private smoothVector = new Vector2(0, 0);

	/** Keep track of mouse lock state (to prevent huge delta when locking mouse) */
	private mouseLocked = Mouse.IsLocked();
	private mouseLockSwapped = false;

	constructor(target: GameObject, config?: FixedCameraConfig) {
		super(target);
		this.Init(config ?? CameraConstants.DefaultFixedCameraConfig);
		this.SetupMobileControls();
	}

	private Init(config: FixedCameraConfig): void {
		// Set all of the values from provided config. We fallback to our defaults, which are optimized for
		// the default Airship character.
		this.config = ObjectUtils.deepCopy(config);
		this.SetXOffset(this.config.xOffset ?? CameraConstants.DefaultFixedCameraConfig.xOffset);
		this.SetYOffset(this.config.yOffset ?? CameraConstants.DefaultFixedCameraConfig.yOffset);
		this.SetZOffset(this.config.zOffset ?? CameraConstants.DefaultFixedCameraConfig.zOffset);
		this.SetMinRotX(this.config.minRotX ?? CameraConstants.DefaultFixedCameraConfig.minRotX);
		this.SetMaxRotX(this.config.maxRotX ?? CameraConstants.DefaultFixedCameraConfig.maxRotX);
		this.SetOcclusionBumping(
			this.config.shouldOcclusionBump ?? CameraConstants.DefaultFixedCameraConfig.shouldOcclusionBump,
		);
		// This enables our character specific behavior for the default Airship character.
		// TODO: Maybe we move this out of here and add a signal that fires when the camera mode
		// is changed?
		let characterLogicBin: Bin | undefined;
		if (this.character && this.character.IsLocalCharacter()) {
			print(`Starting fixed camera for local character.`);
			characterLogicBin = Airship.Camera.ManageFixedCameraForLocalCharacter(this, this.character);
			this.cameraCleanUp.Add(() => characterLogicBin!.Clean());
		}
		this.cameraCleanUp.Add(
			this.onTargetChanged.Connect((event) => {
				if (characterLogicBin && !event.after.character?.IsLocalCharacter()) {
					characterLogicBin.Clean();
				}
				if (event.after.character?.IsLocalCharacter()) {
					characterLogicBin = Airship.Camera.ManageFixedCameraForLocalCharacter(this, event.after.character);
					this.cameraCleanUp.Add(() => characterLogicBin!.Clean());
				}
			}),
		);
	}

	private SetupMobileControls() {
		const touchscreen = this.cameraCleanUp.Add(new Touchscreen());
		let touchStartPos = new Vector3(0, 0, 0);
		let touchStartRotX = 0;
		let touchStartRotY = 0;
		let touchOverUI = false;
		this.cameraCleanUp.Add(
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
							(touchStartRotY - deltaPosSinceStart.x * Airship.Input.GetTouchSensitivity()) % TAU;
						this.rotationX = math.clamp(
							touchStartRotX + deltaPosSinceStart.y * Airship.Input.GetTouchSensitivity(),
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
			}),
		);
	}

	OnStart(camera: Camera, rootTransform: Transform) {
		this.occlusionCam = rootTransform.GetComponent<OcclusionCam>()!;
		if (this.occlusionCam === undefined) {
			this.occlusionCam = rootTransform.gameObject.AddComponent<OcclusionCam>();
		}
		this.occlusionCam.Init(camera);

		this.cameraCleanUp.Add(this.preferred);
		this.cameraCleanUp.Add(this.touchscreen);

		this.cameraCleanUp.Add(
			Airship.Input.preferredControls.ObserveControlScheme((scheme) => {
				if (scheme === ControlScheme.Touch) {
					const unlocker = Mouse.AddUnlocker();
					this.cameraCleanUp.Add(unlocker);
					return () => {
						unlocker();
					};
				}
			}),
		);

		// if (!this.locked) {
		// 	this.cameraCleanUp.Add(Mouse.AddUnlocker());
		// }
	}

	OnStop() {
		print(`Calling stop for fixed camera mode`);
		this.cameraCleanUp.Clean();
	}

	OnUpdate(dt: number) {
		if (Airship.Input.preferredControls.GetControlScheme() === ControlScheme.MouseKeyboard) {
			if (Mouse.IsLocked() && !this.locked) {
				let mouseDelta = Mouse.GetDelta();
				// This is to prevent large jump on first movement (happens always on mac)
				if (this.mouseLockSwapped && mouseDelta.magnitude > 0) {
					this.mouseLockSwapped = false;
					mouseDelta = new Vector2(0, 0);
				}
				let moveDelta = mouseDelta;

				if (this.mouseSmoothingEnabled) {
					const smoothFactor = math.pow(1 / (1 + Airship.Input.GetMouseSmoothing()), Time.deltaTime * 120);
					this.smoothVector = new Vector2(
						Mathf.Lerp(this.smoothVector.x, mouseDelta.x, smoothFactor),
						Mathf.Lerp(this.smoothVector.y, mouseDelta.y, smoothFactor),
					);
					moveDelta = this.smoothVector;
				}

				const mouseSensitivity = Airship.Input.GetMouseSensitivity();

				// Using Screen.width for both X and Y sensitivity (feels wrong having different vertical & horizontal sens)
				this.rotationY =
					(this.rotationY -
						(moveDelta.x / Screen.width) * mouseSensitivity * CameraConstants.SensitivityScalar) %
					TAU;
				this.rotationX = math.clamp(
					this.rotationX +
						(moveDelta.y / Screen.width) * mouseSensitivity * CameraConstants.SensitivityScalar,
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
	}

	OnLateUpdate(dt: number) {
		let xOffset = this.xOffset;

		if (!this.locked && this.rotationX < math.rad(45)) {
			xOffset = MathUtil.Map(this.rotationX, this.minRotX, math.rad(45), 0, xOffset);
		}

		// Polar to cartesian conversion (i.e. the 3D point around the sphere of the character):
		const rotY = this.rotationY - math.pi / 2;
		const xPos = this.zOffset * math.cos(rotY) * math.sin(this.rotationX);
		const zPos = this.zOffset * math.sin(rotY) * math.sin(this.rotationX);
		const yPos = this.zOffset * math.cos(this.rotationX);

		const posOffset = new Vector3(xPos, yPos, zPos);
		const targetPos = this.target?.transform.position ?? Vector3.zero;
		const cameraPos = targetPos.add(new Vector3(0, this.yOffset, 0)).add(this.cameraRightVector.mul(xOffset));
		this.lastCameraPos = cameraPos;

		const newCameraPos = cameraPos.add(this.staticOffset ?? posOffset);
		const lookVector = posOffset.mul(-1).normalized;
		const rotation = Quaternion.LookRotation(lookVector, Vector3.up);

		return new CameraTransform(newCameraPos, rotation);
	}

	/**
	 *
	 * @internal
	 */
	public SetStaticOffset(offset: Vector3 | undefined): void {
		this.staticOffset = offset;
	}

	/**
	 * Sets camera's `x` offset.
	 *
	 * @param xOffset The camera's new `x` offset.
	 */
	public SetXOffset(xOffset: number): void {
		this.xOffset = xOffset;
	}

	/**
	 * Returns the camera's `x` offset.
	 *
	 * @returns The camera's **current** `x` offset.
	 */

	public GetXOffset(): number {
		return this.xOffset;
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
	 * Sets camera's `z` offset.
	 *
	 * @param xOffset The camera's new `z` offset.
	 */

	public SetZOffset(zOffset: number): void {
		this.zOffset = zOffset;
	}

	/**
	 * Returns the camera's `z` offset.
	 *
	 * @returns The camera's **current** `z` offset.
	 */
	public GetZOffset(): number {
		return this.zOffset;
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

	OnPostUpdate(camera: Camera) {
		const transform = camera.transform;
		if (this.shouldBumpForOcclusion) {
			transform.LookAt(this.lastCameraPos);
			this.occlusionCam.BumpForOcclusion(this.lastCameraPos, DefaultCameraMask);
		}
		this.cameraRightVector = transform.right;
		this.cameraForwardVector = transform.forward;
	}

	/**
	 * Sets whether or not camera should bump for occlusion.
	 *
	 * @param shouldBump Whether or not camera should bump for occlusion.
	 */
	public SetOcclusionBumping(shouldBump: boolean): void {
		this.shouldBumpForOcclusion = shouldBump;
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
	 * By default mouse smoothing is enabled. Disable to get precise camera movement (this introduces visible "jumps" of camera angle).
	 */
	public SetMouseSmoothingEnabled(enabled: boolean) {
		this.mouseSmoothingEnabled = enabled;
	}
}
