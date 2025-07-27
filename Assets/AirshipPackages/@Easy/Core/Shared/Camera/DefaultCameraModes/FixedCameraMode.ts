import { Airship } from "@Easy/Core/Shared/Airship";
import { ControlScheme, Mouse, Preferred, Touchscreen } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CameraMode, CameraTransform } from "..";
import { MoveDirectionMode } from "../../Character/LocalCharacter/MoveDirectionMode";
import { TweenEasingFunction } from "../../Tween/EasingFunctions";
import { Tween } from "../../Tween/Tween";
import ObjectUtils from "../../Util/ObjectUtils";
import { CameraConstants, FixedCameraConfig } from "../CameraConstants";
import { OcclusionCameraManager } from "../OcclusionCameraManager";

const TAU = math.pi * 2;

export class FixedCameraMode extends CameraMode {
	GetFriendlyName(): string {
		return "Fixed Camera Mode";
	}

	public OnStopBin = new Bin();
	private readonly preferred = this.OnStopBin.Add(new Preferred());
	private readonly touchscreen = this.OnStopBin.Add(new Touchscreen());

	public config: FixedCameraConfig;
	private locked = false;
	private shouldBumpForOcclusion = true;
	private xOffset = 0;
	private yOffset = 0;
	private zOffset = 0;
	private staticOffset: Vector3 | undefined;
	private minRotX = math.rad(1);
	private maxRotX = math.rad(179);

	public useXOffsetInOcclusionCam = true;
	/** The minimum percent of x-offset you can have in occlusion cam
	 * Not recommended to set too high as it determines LOS check point
	 */
	public minXOffsetPercentInOcclusionCam = 0.3;

	/**
	 * When set to `useXOffsetInOcclusionCam` is set to true, this will tween to `1`.
	 */
	private useXOffsetInOcclusionCamStrength = 0;

	private lastTargetPos: Vector3 | undefined;
	private lastRot: Quaternion | undefined;

	private occlusionCam!: OcclusionCam;

	private lookBehind = false;

	public cameraForwardVector = Vector3.zero;

	private lastCameraPos = new Vector3(0, 0, 0);

	private mouseSmoothingEnabled = true;
	private smoothVector = new Vector2(0, 0);

	/** Keep track of mouse lock state (to prevent huge delta when locking mouse) */
	private mouseLocked = Mouse.IsLocked();
	private mouseLockSwapped = false;

	private crouching = false;
	private crouchTweenBin = new Bin();
	private currentCrouchYOffset = 0;

	/** How much the camera is vertically offset while crouching. */
	public crouchYOffset = -0.57;

	constructor(target: GameObject, config?: FixedCameraConfig) {
		super(target);
		this.Init(config ?? CameraConstants.DefaultFixedCameraConfig);
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
		Airship.Characters.localCharacterManager.SetMoveDirMode(MoveDirectionMode.Character);
	}

	private SetupMobileControls() {
		const touchscreen = this.OnStopBin.Add(new Touchscreen());
		let touchStartPos = new Vector3(0, 0, 0);
		let touchStartRotX = 0;
		let touchStartRotY = 0;
		let touchOverUI = false;
		this.OnStopBin.Add(
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

	OnEnable(camera: Camera, rootTransform: Transform) {
		this.SetupMobileControls();

		this.occlusionCam = rootTransform.GetComponent<OcclusionCam>()!;
		if (this.occlusionCam === undefined) {
			this.occlusionCam = rootTransform.gameObject.AddComponent<OcclusionCam>();
		}
		this.occlusionCam.Init(camera);

		this.OnStopBin.Add(this.preferred);
		this.OnStopBin.Add(this.touchscreen);

		this.OnStopBin.Add(
			Airship.Input.preferredControls.ObserveControlScheme((scheme) => {
				if (scheme === ControlScheme.Touch) {
					const unlocker = Mouse.AddUnlocker();
					this.OnStopBin.Add(unlocker);
					return () => {
						unlocker();
					};
				}
			}),
		);

		let characterLogicBin: Bin | undefined;
		if (this.character && this.character.IsLocalCharacter() && !this.character.IsDestroyed()) {
			characterLogicBin = Airship.Camera.ManageFixedCameraForLocalCharacter(this, this.character);
			this.OnStopBin.Add(() => characterLogicBin!.Clean());
		}
		this.OnStopBin.Add(
			this.onTargetChanged.Connect((event) => {
				if (characterLogicBin && !event.after.character?.IsLocalCharacter()) {
					characterLogicBin.Clean();
				}
				if (event.after.character?.IsLocalCharacter()) {
					characterLogicBin = Airship.Camera.ManageFixedCameraForLocalCharacter(this, event.after.character);
					this.OnStopBin.Add(() => characterLogicBin!.Clean());
				}
			}),
		);
	}

	public SetCrouching(crouching: boolean): void {
		if (this.crouching === crouching) return;
		this.crouching = crouching;
		this.crouchTweenBin.Clean();

		if (crouching) {
			this.crouchTweenBin.Add(
				Tween.Number(TweenEasingFunction.Linear, 0.16, (val) => {
					this.currentCrouchYOffset = val * this.crouchYOffset;
				}),
			);
		} else {
			this.crouchTweenBin.Add(
				Tween.Number(TweenEasingFunction.Linear, 0.16, (val) => {
					this.currentCrouchYOffset = (1 - val) * this.crouchYOffset;
				}),
			);
		}
	}

	public IsCrouching(): boolean {
		return this.crouching;
	}

	OnDisable() {
		this.OnStopBin.Clean();
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
						math.lerpClamped(this.smoothVector.x, mouseDelta.x, smoothFactor),
						math.lerpClamped(this.smoothVector.y, mouseDelta.y, smoothFactor),
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
		const characterTarget = this.GetCharacterTarget();
		if (characterTarget && (characterTarget.IsDead() || characterTarget.IsDestroyed())) {
			return new CameraTransform(this.lastTargetPos ?? Vector3.zero, this.lastRot ?? Quaternion.identity);
		}
		let visualTarget = characterTarget?.model.transform ?? this.target?.transform;

		// Polar to cartesian conversion (i.e. the 3D point around the sphere of the character):
		const rotYOffset = this.lookBehind ? math.pi : 0;
		const rotY = this.rotationY + rotYOffset - math.pi / 2;
		const xPos = this.zOffset * math.cos(rotY) * math.sin(this.rotationX);
		const zPos = this.zOffset * math.sin(rotY) * math.sin(this.rotationX);
		const yPos = this.zOffset * math.cos(this.rotationX);

		const posOffset = new Vector3(xPos, yPos, zPos);
		const targetPos = visualTarget?.position ?? Vector3.zero;
		this.lastTargetPos = targetPos;

		const lookVector = posOffset.mul(-1).normalized;
		const rotation = Quaternion.LookRotation(lookVector, Vector3.up);
		this.lastRot = rotation;

		let yOffset = this.yOffset + this.currentCrouchYOffset;
		const cameraPos = targetPos.add(new Vector3(0, yOffset, 0)).add(rotation.mul(Vector3.right).mul(this.xOffset));
		this.lastCameraPos = cameraPos;

		const newCameraPos = cameraPos.add(this.staticOffset ?? posOffset);

		// print(
		// 	`rotY: ${rotY}, cameraPos: ${newCameraPos}, targetPos: ${targetPos}`,
		// );

		// if (characterTarget) {
		// 	characterTarget.model.transform.rotation = Quaternion.LookRotation(lookVector.WithY(0));
		// }

		return new CameraTransform(newCameraPos, rotation);
	}

	OnPostUpdate(cameraHolder: Transform) {
		// This breaks the camera in first person.
		// What is the point of this line?
		if (!Airship.Camera.IsFirstPerson()) {
			cameraHolder.LookAt(this.lastCameraPos);
		}

		if (this.shouldBumpForOcclusion && this.lastTargetPos && !Airship.Camera.IsFirstPerson()) {
			const yOffset = this.yOffset + this.currentCrouchYOffset;
			let targetPosition = this.lastTargetPos.add(Vector3.up.mul(yOffset));

			{
				let delta = Time.deltaTime * 10;
				if (!this.useXOffsetInOcclusionCam) delta *= -1;

				this.useXOffsetInOcclusionCamStrength = math.clamp(this.useXOffsetInOcclusionCamStrength + delta, 0, 1);
				if (this.useXOffsetInOcclusionCamStrength > 0) {
					targetPosition = targetPosition.add(
						cameraHolder.right.mul(this.xOffset).mul(this.useXOffsetInOcclusionCamStrength),
					);
				}
			}

			// this is used only as a marker to determine if we have LOS of the character in BumpForOcclusion
			let lineOfSightCheckPos;
			// fallback to targetPosition if no character
			if (!this.character?.transform) {
				lineOfSightCheckPos = targetPosition;
			} else {
				// initially set character position to head level, adjusted for crouching
				lineOfSightCheckPos = this.character?.transform.position.add(
					new Vector3(0, 1.5 + this.currentCrouchYOffset, 0),
				);

				// move LOS check in the direction of x-offset (effectively towards crosshair)
				if (lineOfSightCheckPos !== targetPosition) {
					const xOffsetDir = targetPosition
						.WithY(0)
						.sub(lineOfSightCheckPos.WithY(0))
						.normalized.mul(this.minXOffsetPercentInOcclusionCam);

					// ensure we aren't in a wall--lineOfSightCheckPos is used as the origin
					// for the LOS raycast, and raycasts do not detect collisions for colliders
					// on top of the origin
					const [hit, hitPoint, hitNormal] = Physics.Raycast(
						lineOfSightCheckPos,
						xOffsetDir,
						xOffsetDir.magnitude,
						OcclusionCameraManager.GetMask(),
						QueryTriggerInteraction.Ignore,
					);

					if (hit) {
						// move off the occlusion a bit
						lineOfSightCheckPos = hitPoint.add(hitNormal.mul(0.1));
					} else {
						lineOfSightCheckPos = lineOfSightCheckPos.add(xOffsetDir);
					}
				}
			}

			//Collide camera with enviornment and send signal with new camera distance
			const distance = this.occlusionCam.BumpForOcclusion(
				targetPosition,
				lineOfSightCheckPos,
				OcclusionCameraManager.GetMask(),
			);
			this.onTargetDistance.Fire(distance, this.occlusionCam.transform.position, targetPosition);
		}
		this.cameraForwardVector = this.lookBehind ? cameraHolder.forward.mul(-1) : cameraHolder.forward;
	}

	/**
	 * Bulk updates camera properties.
	 *
	 * @param properties `FixedCamera` properties.
	 */
	public UpdateProperties(properties: Partial<FixedCameraConfig>): void {
		if (properties.xOffset) this.SetXOffset(properties.xOffset);
		if (properties.yOffset) this.SetYOffset(properties.yOffset);
		if (properties.zOffset) this.SetZOffset(properties.zOffset);
		if (properties.minRotX) this.SetMinRotX(properties.minRotX);
		if (properties.maxRotX) this.SetMaxRotX(properties.maxRotX);
		if (properties.shouldOcclusionBump) this.SetOcclusionBumping(properties.shouldOcclusionBump);
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

	/**
	 * Returns whether or not this camera is locked.
	 *
	 * @returns Whether or not this camera is locked.
	 */
	public GetLocked(): boolean {
		return this.locked;
	}

	/**
	 * Sets whether or not camera should look behind.
	 *
	 * @param lookBehind Whether or not camera should look behind.
	 */
	public SetLookBackwards(lookBehind: boolean): void {
		this.lookBehind = lookBehind;
	}

	/**
	 * Returns whether or not camera is currently looking behind.
	 *
	 * @returns Whether or not camera is currently looking behind.
	 */
	public GetLookBackwards(): boolean {
		return this.lookBehind;
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
