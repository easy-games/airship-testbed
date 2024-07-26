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
import { CameraReferences } from "./CameraReferences";
import CameraRig from "./CameraRig";
import { CameraSystem } from "./CameraSystem";
import { CharacterCameraType } from "./CharacterCameraType";
import { FlyCameraMode } from "./DefaultCameraModes/FlyCameraMode";
import { HumanoidCameraMode } from "./DefaultCameraModes/HumanoidCameraMode";
import { OrbitCameraMode } from "./DefaultCameraModes/OrbitCameraMode";
import { FirstPersonCameraSystem } from "./FirstPersonCameraSystem";

interface CharacterStateSnapshot {
	/** Is character currently sprinting */
	sprinting: boolean;
	/** Is character in first person */
	firstPerson: boolean;
}

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
	public humanoidCameraMode: HumanoidCameraMode | undefined;
	private orbitCameraMode: OrbitCameraMode | undefined;

	private characterCameraMode: CharacterCameraMode = CharacterCameraMode.Locked;

	private sprintFOVEnabled = true;
	private manageFOV = true;
	private overrideFOV = new Map<CharacterCameraType, number>();

	private firstPersonFOV = 80;
	private thirdPersonFOV = 70;

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
		this.SetMode(this.characterCameraMode);
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
			const isSprinting = Dependency<LocalCharacterSingleton>().input?.IsSprinting();
			this.UpdateLocalCharacterState({
				sprinting: isSprinting || state === CharacterState.Sliding,
			});
		});
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
		this.manageFOV = shouldManage;
	}

	/**
	 * If FOV is managed, camera fov will be updated by tweens.
	 * You must control the FOV by calling {@link SetFOV}
	 *
	 * It's useful to turn this off when you want to manage FOV entirely yourself.
	 *
	 * @returns true if FOV is being managed by the CharacterCamera system.
	 */
	public IsFOVManaged(): boolean {
		return this.manageFOV;
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
	public UpdateLocalCharacterState(stateUpdate: Partial<CharacterStateSnapshot>) {
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

		if (didUpdate) this.MakeFOVReflectCharacterState();
	}

	/** Updates FOV to reflect the current character state object */
	private MakeFOVReflectCharacterState(): void {
		if (!this.IsEnabled()) return;
		if (!this.IsSprintFOVEnabled()) return;
		if (!this.IsFOVManaged()) return;

		// first person
		{
			let fov = this.overrideFOV.get(CharacterCameraType.FIRST_PERSON) ?? this.firstPersonFOV;
			if (this.characterState?.sprinting) {
				fov *= this.sprintFovMultiplier;
			}
			// this.SetFOV(CharacterCameraType.FIRST_PERSON, fov, true);
			this.cameraSystem?.SetFOV(CharacterCameraType.FIRST_PERSON, fov, false);
		}

		// third person
		{
			let fov = this.overrideFOV.get(CharacterCameraType.THIRD_PERSON) ?? this.thirdPersonFOV;
			if (this.characterState?.sprinting) {
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

	private CreateHumanoidCameraMode(character: Character): HumanoidCameraMode {
		this.humanoidCameraMode = new HumanoidCameraMode(character, character.model, this.firstPerson);
		this.humanoidCameraMode.SetLookBackwards(this.lookBackwards);
		this.humanoidCameraMode.SetFirstPerson(this.firstPerson);
		return this.humanoidCameraMode;
	}

	private CreateOrbitCameraMode(character: Character): OrbitCameraMode {
		return new OrbitCameraMode(4, character.gameObject.transform, character.model.transform);
	}

	/**
	 * @internal
	 */
	public SetupCamera(character: Character) {
		if (this.characterCameraMode === CharacterCameraMode.Locked) {
			this.SetModeInternal(this.CreateHumanoidCameraMode(character));
			this.cameraSystem?.SetOnClearCallback(() => this.CreateHumanoidCameraMode(character));
		} else if (this.characterCameraMode === CharacterCameraMode.Orbit) {
			this.SetModeInternal(this.CreateOrbitCameraMode(character));
			this.cameraSystem?.SetOnClearCallback(() => this.CreateOrbitCameraMode(character));
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
				if (this.cameraSystem?.GetMode() === this.humanoidCameraMode) {
					this.ToggleFirstPerson();
				}
			}),
		);

		// Toggle look backwards:
		bin.Add(
			Keyboard.OnKeyDown(Key.H, (event) => {
				if (!this.IsEnabled()) return;
				if (event.uiProcessed) return;
				if (this.cameraSystem?.GetMode() === this.humanoidCameraMode) {
					this.SetLookBackwards(!this.lookBackwards);
				}
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

	public SetMode(mode: CharacterCameraMode): void {
		if (!Game.IsClient()) return;
		this.characterCameraMode = mode;

		if (Game.localPlayer.character) {
			const character = Game.localPlayer.character;
			if (mode === CharacterCameraMode.Locked) {
				this.SetModeInternal(this.CreateHumanoidCameraMode(character));
			} else if (mode === CharacterCameraMode.Orbit) {
				this.SetModeInternal(this.CreateOrbitCameraMode(character));
			}
		}

		if (mode !== CharacterCameraMode.Locked) {
			this.firstPerson = false;
		}
	}

	private SetLookBackwards(lookBackwards: boolean) {
		if (this.lookBackwards === lookBackwards) return;
		this.lookBackwards = lookBackwards;
		this.lookBackwardsChanged.Fire(this.lookBackwards);

		if (this.cameraSystem?.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode?.SetLookBackwards(this.lookBackwards);
		}
	}

	public ToggleFirstPerson() {
		this.SetFirstPerson(!this.firstPerson);
	}

	/**
	 * Changes the preferred perspective for the local character.
	 *
	 * This will only work if using {@link CharacterCameraMode.Locked}. You can set this with {@link SetMode()}
	 */
	public SetFirstPerson(value: boolean) {
		assert(
			this.characterCameraMode === CharacterCameraMode.Locked,
			"SetFirstPerson() can only be called when using CharacterCameraMode.Locked",
		);

		if (this.firstPerson === value) {
			return;
		}

		this.firstPerson = value;
		this.firstPersonChanged.Fire(this.firstPerson);

		if (this.cameraSystem?.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode?.SetFirstPerson(this.firstPerson);
		}
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
