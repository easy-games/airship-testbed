import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { CameraMode } from ".";
import { Airship } from "../Airship";
import Character from "../Character/Character";
import { CharacterCameraMode } from "../Character/LocalCharacter/CharacterCameraMode";
import { LocalCharacterSingleton } from "../Character/LocalCharacter/LocalCharacterSingleton";
import { Game } from "../Game";
import { Keyboard } from "../UserInput";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
import { OnLateUpdate, OnUpdate } from "../Util/Timer";
import { CameraConstants } from "./CameraConstants";
import { CameraReferences } from "./CameraReferences";
import CameraRig from "./CameraRig";
import { CameraSystem } from "./CameraSystem";
import { CharacterCameraType } from "./CharacterCameraType";
import { FixedCameraMode } from "./DefaultCameraModes/FixedCameraMode";
import { FlyCameraMode } from "./DefaultCameraModes/FlyCameraMode";
import { OrbitCameraMode } from "./DefaultCameraModes/OrbitCameraMode";
import { FirstPersonCameraSystem } from "./FirstPersonCameraSystem";

interface CharacterStateSnapshot {
	/** Is character currently sprinting */
	sprinting: boolean;
	/** Is character in first person */
	firstPerson: boolean;
}

/**
 * This class is responsible for:
 * - Changing field of view when swapping to and from first person (they use different fov values)
 * - Increasing field of view when sprinting
 * - Allow toggling to and from first person by toggling the ViewmodelCamera
 */
@Singleton({})
export class AirshipCharacterCameraSingleton {
	public canToggleFirstPerson = true;

	private lookBackwards = false;

	/** Fires whenever the user requests to look (or stop looking) backwards. */
	public readonly lookBackwardsChanged = new Signal<[lookBackwards: boolean]>();

	/** The underlying camera system for the game. */
	public cameraSystem?: CameraSystem;

	/** Current state of local character (relevant to the camera system). */
	private characterState: CharacterStateSnapshot | undefined;
	private sprintFovMultiplier = 1.08;

	private firstPerson = false;

	/** Fires whenever the user changes their first-person state. */
	public readonly firstPersonChanged = new Signal<[isFirstPerson: boolean]>();

	private fps?: FirstPersonCameraSystem;
	public activeCameraMode: CameraMode | undefined;

	public characterCameraMode: CharacterCameraMode = CharacterCameraMode.Fixed;

	private sprintFOVEnabled = true;
	private isFOVManaged = true;
	private overrideFOV = new Map<CharacterCameraType, number>();

	private firstPersonFOV = 80;
	private thirdPersonFOV = 70;

	private lastSprintTime = 0;

	constructor() {
		Airship.Camera = this;
	}

	/**
	 * @internal
	 */
	public StartNewCameraSystem(cameraRig: CameraRig): CameraSystem {
		CameraReferences.cameraHolder = cameraRig.transform;
		CameraReferences.mainCamera = cameraRig.mainCamera;
		CameraReferences.viewmodelCamera = cameraRig.viewmodelCamera;

		this.cameraSystem = new CameraSystem();
		//this.SetMode(this.characterCameraMode);
		return this.cameraSystem;
	}

	/**
	 * Shutdown the whole Airship.Character camera system.
	 *
	 * This will cause the CameraRig to stop being controlled in any way.
	 */
	public StopCameraSystem() {
		CameraReferences.cameraHolder = undefined;
		CameraReferences.mainCamera = undefined;
		CameraReferences.viewmodelCamera = undefined;

		this.cameraSystem?.SetEnabled(false);
		this.cameraSystem = undefined;
	}

	protected OnStart(): void {
		Dependency<LocalCharacterSingleton>().stateChanged.Connect((state) => {
			// const isSprinting = Dependency<LocalCharacterSingleton>().input?.IsSprinting();
			this.UpdateLocalCharacterState({
				sprinting:
					state === CharacterState.Sprinting ||
					(state === CharacterState.Airborne && Airship.Input.IsDown("Sprint")),
			});
		});

		if (Game.IsClient()) {
			const p = Game.localPlayer;
			OnUpdate.Connect(() => {
				if (p.character?.movement?.IsSprinting()) {
					this.lastSprintTime = Time.unscaledTime;
				}
				this.MakeFOVReflectCharacterState();
			});
		}
	}

	/**
	 * Sets whether or not the camera system is enabled. Disable the
	 * camera system if custom camera code is being used.
	 */
	public SetEnabled(enabled: boolean) {
		this.cameraSystem?.SetEnabled(enabled);
	}

	public SetSprintFOVEnabled(enabled: boolean): void {
		this.sprintFOVEnabled = enabled;
	}

	public IsSprintFOVEnabled(): boolean {
		return this.sprintFOVEnabled;
	}

	/**
	 * Sets if camera FOVs should be tweened.
	 * @param shouldManage True if camera FOVs should be tweened by this class.
	 */
	public SetFOVManaged(shouldManage: boolean): void {
		this.isFOVManaged = shouldManage;
	}

	/**
	 * If Field of View is managed, camera fov will be updated by tweens.
	 * You must control the FOV by calling {@link SetFOV}
	 *
	 * It's useful to turn this off when you want to manage FOV entirely yourself.
	 *
	 * @returns true if FOV is being managed by the CharacterCamera system.
	 */
	public IsFOVManaged(): boolean {
		return this.isFOVManaged;
	}

	/**
	 * Returns `true` if the camera system is enabled.
	 */
	public IsEnabled() {
		return this.cameraSystem?.IsEnabled();
	}

	/**
	 * Set the current camera mode.
	 *
	 * @param mode New mode.
	 */
	private SetModeInternal(mode: CameraMode) {
		this.activeCameraMode = mode;
		this.cameraSystem?.SetMode(mode);
	}

	/**
	 * Sets the camera to a static view.
	 */
	public ClearMode() {
		this.cameraSystem?.ClearMode();
	}

	/**
	 * Set the camera's field-of-view.
	 * @param fieldOfView Field of view.
	 * @param smooth If `true` the FOV will transition smoothly to the target.
	 */
	public SetFOV(targetCameraType: CharacterCameraType, fieldOfView: number, smooth = false) {
		this.overrideFOV.set(targetCameraType, fieldOfView);
		this.cameraSystem?.SetFOV(targetCameraType, fieldOfView, !smooth);
	}

	/**
	 * Returns the camera's field-of-view.
	 */
	public GetFOV(targetCamera: CharacterCameraType) {
		assert(this.cameraSystem, "Failed to GetFOV: No camera system setup");
		return this.cameraSystem.GetFOV(targetCamera);
	}

	/**
	 * @internal
	 */
	private UpdateLocalCharacterState(stateUpdate: Partial<CharacterStateSnapshot>) {
		let didUpdate = false;
		if (!this.characterState) {
			this.characterState = { sprinting: false, firstPerson: false };
			didUpdate = true;
		}

		for (const [k, v] of ObjectUtils.entries(stateUpdate)) {
			if (this.characterState[k] !== v) {
				this.characterState[k] = v;

				if (k === "sprinting" && this.sprintFovMultiplier === 1) {
					continue;
				}
				didUpdate = true;
			}
		}

		this.characterState = ObjectUtils.assign<CharacterStateSnapshot, Partial<CharacterStateSnapshot>>(
			this.characterState,
			stateUpdate,
		);
	}

	/** Updates FOV to reflect the current character state object */
	private MakeFOVReflectCharacterState(): void {
		if (!this.IsEnabled()) return;
		if (!this.IsSprintFOVEnabled()) return;
		if (!this.IsFOVManaged()) return;

		let hasSprintFov = false;
		if (Time.unscaledTime - this.lastSprintTime < 0.1) {
			hasSprintFov = true;
		}

		// first person
		{
			let fov = this.overrideFOV.get(CharacterCameraType.FIRST_PERSON) ?? this.firstPersonFOV;
			if (hasSprintFov) {
				fov *= this.sprintFovMultiplier;
			}
			this.cameraSystem?.SetFOV(CharacterCameraType.FIRST_PERSON, fov, false);
		}

		// third person
		{
			let fov = this.overrideFOV.get(CharacterCameraType.THIRD_PERSON) ?? this.thirdPersonFOV;
			if (hasSprintFov) {
				fov *= this.sprintFovMultiplier;
			}
			this.cameraSystem?.SetFOV(CharacterCameraType.THIRD_PERSON, fov, false);
		}
	}

	/**
	 * Sets multiplier on base FOV when sprinting. For example if FOV is 80 and multipler is 1.1 the player FOV
	 * while sprinting will be 88.
	 *
	 * @param multipler Sprint FOV multiplier, set to 1 to disable sprint FOV. Defaults to 1.08
	 */
	public SetSprintFOVMultiplier(multipler: number) {
		this.sprintFovMultiplier = multipler;

		this.MakeFOVReflectCharacterState();
	}

	/** Returns `true` if the player is in first-person mode. */
	public IsFirstPerson() {
		return this.firstPerson;
	}

	/** Observes the current first-person state. */
	public ObserveFirstPerson(observer: (isFirstPerson: boolean) => CleanupFunc): () => void {
		let currentCleanup: CleanupFunc;

		const onChanged = (isFirstPerson: boolean) => {
			currentCleanup?.();
			currentCleanup = observer(isFirstPerson);
			this.UpdateLocalCharacterState({ firstPerson: true });
		};

		const disconnect = this.firstPersonChanged.Connect(onChanged);
		onChanged(this.firstPerson);

		return () => {
			disconnect();
			currentCleanup?.();
		};
	}

	/**
	 * @internal
	 */
	public SetupCamera(character: Character) {
		if (this.characterCameraMode === CharacterCameraMode.Fixed) {
			this.SetMode(CharacterCameraMode.Fixed);
		} else if (this.characterCameraMode === CharacterCameraMode.Orbit) {
			this.SetMode(CharacterCameraMode.Orbit);
		}

		//Set up first person camera
		this.fps = new FirstPersonCameraSystem(character, this.firstPerson);
	}

	/**
	 * Cleanup camera when character is removed
	 *
	 * @internal
	 */
	public CleanupCamera() {
		this.cameraSystem?.SetOnClearCallback(undefined);
		this.ClearMode();
		this.fps?.Destroy();
	}

	/**
	 * @internal
	 */
	public SetupCameraControls(bin: Bin) {
		// Toggle first person:
		bin.Add(
			Keyboard.OnKeyDown(Key.T, (event) => {
				if (!this.IsEnabled()) return;
				if (event.uiProcessed) return;
				if (!this.canToggleFirstPerson) return;
				if (this.cameraSystem?.GetMode() === this.activeCameraMode) {
					this.ToggleFirstPerson();
				}
			}),
		);

		// Toggle look backwards:
		bin.Add(
			Keyboard.OnKeyDown(Key.H, (event) => {
				if (!this.IsEnabled()) return;
				if (event.uiProcessed) return;
				if (this.firstPerson) return;
				const mode = this.GetMode();
				if (!mode) return;
				const newBackwardsState = !mode.GetLookBackwards();
				mode.SetLookBackwards(newBackwardsState);
				// this.SetLookBackwards(!this.lookBackwards);
			}),
		);

		let flyCam = false;
		const flyingBin = new Bin();

		// Toggle fly cam:
		bin.Add(
			Keyboard.OnKeyDown(Key.P, (event) => {
				if (event.uiProcessed) return;
				if (Keyboard.IsKeyDown(Key.LeftShift)) {
					if (flyCam) {
						flyCam = false;
						flyingBin.Clean();
					} else {
						flyCam = true;
						let backToFirstPerson = this.firstPerson;
						if (backToFirstPerson) {
							this.SetFirstPerson(false);
						}
						this.SetModeInternal(new FlyCameraMode());
						flyingBin.Add(() => {
							this.ClearMode();
							if (backToFirstPerson) {
								this.SetFirstPerson(true);
							}
						});
						flyingBin.Add(Dependency<LocalCharacterSingleton>().input!.AddDisabler());
						if (Airship.Inventory.localInventory) {
							flyingBin.Add(Airship.Inventory.localInventory.AddControlsDisabler());
						}
					}
				}
			}),
		);
	}

	/**
	 * Returns the `CameraMode` of type `T`. If a generic type is _not_ provided,
	 * this defaults to the standard camera mode `FixedCameraMode`.
	 *
	 * @returns The `CameraMode`, if it exists. Otherwise, `undefined`.
	 */
	public GetMode<T extends CameraMode = FixedCameraMode>(): T | undefined {
		const mode = this.cameraSystem?.GetMode();
		if (!mode) return undefined;
		return mode as T;
	}

	/**
	 * Sets a new `CharacterCameraMode`. If the local character _does_ not exist when
	 * this function is called, the camera mode's target is set to a `GameObject` located
	 * at `Vector3.zero`.
	 *
	 * @param characterCameraMode A `CharacterCameraMode`.
	 */
	public SetMode(characterCameraMode: CharacterCameraMode): CameraMode {
		this.characterCameraMode = characterCameraMode;
		const target =
			Game.localPlayer.character?.model ?? GameObject.CreateAtPos(Vector3.zero, "CameraTargetPlaceholder");
		if (characterCameraMode === CharacterCameraMode.Fixed) {
			const mode = new FixedCameraMode(target);
			this.SetModeInternal(mode);
			return mode;
		} else {
			const mode = new OrbitCameraMode(target);
			this.SetModeInternal(mode);
			return mode;
		}
	}

	/**
	 * Sets and returns a new custom `CameraMode`.
	 *
	 * @param mode The `CameraMode` that is being set.
	 * @returns The new `CameraMode`.
	 */
	public SetModeCustom(mode: CameraMode): CameraMode {
		this.SetModeInternal(mode);
		return mode;
	}

	/**
	 * @internal
	 */
	public ManageFixedCameraForLocalCharacter(mode: FixedCameraMode, character: Character): Bin {
		const cleanup = new Bin();
		if (character.IsLocalCharacter()) {
			// The first thing we do for `Character` targets is synchronize the camera
			// with their current look vector.
			if (character.movement) {
				mode.SetYAxisDirection(character.movement.GetLookVector());
			}

			const setFirstPerson = () => {
				mode.SetXOffset(CameraConstants.DefaultFirstPersonFixedCameraConfig.xOffset!);
				mode.SetZOffset(CameraConstants.DefaultFirstPersonFixedCameraConfig.zOffset!);
				mode.SetOcclusionBumping(CameraConstants.DefaultFirstPersonFixedCameraConfig.shouldOcclusionBump!);
				mode.SetStaticOffset(CameraConstants.DefaultFirstPersonFixedCameraConfig.staticOffset);
				mode.SetLookBackwards(false);
			};

			const setThirdPerson = () => {
				mode.SetXOffset(CameraConstants.DefaultFixedCameraConfig.xOffset);
				mode.SetZOffset(CameraConstants.DefaultFixedCameraConfig.zOffset);
				mode.SetOcclusionBumping(CameraConstants.DefaultFixedCameraConfig.shouldOcclusionBump);
				mode.SetStaticOffset(undefined);
			};

			// If the character started in first person mode, immediately update the fixed camera
			// values. Otherwise, do so when the perspective changes.
			if (this.IsFirstPerson()) {
				setFirstPerson();
			}
			const firstPersonChanged = this.firstPersonChanged.Connect((isFirstPerson) => {
				if (isFirstPerson) {
					setFirstPerson();
				} else {
					setThirdPerson();
				}
			});

			// If the target `Character` crouches, and is in first person, animate the camera's
			// `y` offset.
			let targetOffsetY = CameraConstants.DefaultFixedCameraConfig.yOffset;
			const stateChanged = character.onStateChanged.Connect(() => {
				if (!this.IsFirstPerson()) return;
				const isCrouching = character.state === CharacterState.Crouching;
				targetOffsetY = isCrouching
					? CameraConstants.FirstPersonCrouchConfig.yOffset
					: CameraConstants.DefaultFixedCameraConfig.yOffset;
			});
			const crouchAnimator = OnUpdate.Connect((dt) => {
				const currentOffsetY = mode.GetYOffset();
				if (currentOffsetY === targetOffsetY) return;
				const newOffsetY =
					currentOffsetY < targetOffsetY
						? math.clamp(
								currentOffsetY + dt * CameraConstants.FirstPersonCrouchConfig.speed,
								0,
								targetOffsetY,
						  )
						: math.clamp(
								currentOffsetY - dt * CameraConstants.FirstPersonCrouchConfig.speed,
								targetOffsetY,
								targetOffsetY * 2,
						  );
				mode.SetYOffset(newOffsetY);
			});

			// When the fixed camera is targeting the local `Character`, synchronize the character &
			// camera's look vectors.
			const lookVectorSync = OnLateUpdate.Connect(() => {
				if (!character.movement) return;
				if (character.movement.disableInput) return;
				character.movement.SetLookVector(mode.cameraForwardVector);
			});

			if (character.movement) {
				const lookVectorSyncInverse = character.movement.OnNewLookVector((lookVector) => {
					if (!character.movement) return;
					if (character.movement.disableInput) return;
					character.movement.SetLookVectorRecurring(mode.cameraForwardVector);
					mode.SetYAxisDirection(lookVector);
				});
				cleanup.Add(() => Bridge.DisconnectEvent(lookVectorSyncInverse));
			}

			cleanup.Add(crouchAnimator);
			cleanup.Add(stateChanged);
			cleanup.Add(firstPersonChanged);
			cleanup.Add(lookVectorSync);
		}

		return cleanup;
	}

	/**
	 * @internal
	 */
	public ManageOrbitCameraForLocalCharacter(mode: OrbitCameraMode, character: Character): Bin {
		const cleanup = new Bin();
		if (character.IsLocalCharacter()) {
			// The first thing we do for `Character` targets is synchronize the camera
			// with their current look vector.
			if (character.movement) {
				mode.SetYAxisDirection(character.movement.GetLookVector());
			}

			// When the fixed camera is targeting the local `Character`, synchronize the character &
			// camera's look vectors.
			const lookVectorSync = OnLateUpdate.Connect(() => {
				if (!character.movement) return;
				if (character.movement.disableInput) return;
				character.movement.SetLookVector(mode.cameraForwardVector);
			});

			if (character.movement) {
				const lookVectorSyncInverse = character.movement.OnNewLookVector((lookVector) => {
					if (!character.movement) return;
					if (character.movement.disableInput) return;
					character.movement.SetLookVectorRecurring(mode.cameraForwardVector);
					mode.SetYAxisDirection(lookVector);
				});
				cleanup.Add(() => Bridge.DisconnectEvent(lookVectorSyncInverse));
			}

			cleanup.Add(lookVectorSync);
		}

		return cleanup;
	}

	public ToggleFirstPerson() {
		this.SetFirstPerson(!this.firstPerson);
	}

	/**
	 * Changes the preferred perspective for the local character.
	 *
	 * This will only work if using {@link CharacterCameraMode.Fixed}. You can set this with {@link SetModeCustom()}
	 */
	public SetFirstPerson(value: boolean) {
		assert(
			this.characterCameraMode === CharacterCameraMode.Fixed,
			"SetFirstPerson() can only be called when using CharacterCameraMode.Locked",
		);

		if (this.firstPerson === value) {
			return;
		}

		this.firstPerson = value;
		this.firstPersonChanged.Fire(this.firstPerson);

		this.fps?.OnFirstPersonChanged(this.firstPerson);
	}

	/** Observes whether or not the player wants to look backwards. */
	public ObserveLookBackwards(observer: (lookBackwards: boolean) => CleanupFunc): () => void {
		let currentCleanup: CleanupFunc;

		const onChanged = (lookBackwards: boolean) => {
			currentCleanup?.();
			currentCleanup = observer(lookBackwards);
		};

		const disconnect = this.lookBackwardsChanged.Connect(onChanged);
		onChanged(this.lookBackwards);

		return () => {
			disconnect();
			currentCleanup?.();
		};
	}
}
