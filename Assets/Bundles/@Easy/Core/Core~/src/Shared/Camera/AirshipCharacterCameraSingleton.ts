import ObjectUtils from "@easy-games/unity-object-utils";
import { Controller, Dependency, OnStart } from "Shared/Flamework";
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

interface ViewModelUpdate {
	/** Target position of the view model. Update to change. */
	position: Vector3;
	/** Target rotation of the view model. Update to change. */
	rotation: Quaternion;
}

@Controller({})
export class AirshipCharacterCameraSingleton implements OnStart {
	public static readonly cameraReferenceKey = "CameraRig";

	public canToggleFirstPerson = true;

	private lookBackwards = false;

	/** Fires whenever the user requests to look (or stop looking) backwards. */
	public readonly lookBackwardsChanged = new Signal<[lookBackwards: boolean]>();

	/** The underlying camera system for the game. */
	public readonly cameraSystem?: CameraSystem;

	/** Current state of local character (relevant to the camera system). */
	private characterState: CharacterStateSnapshot | undefined;
	private sprintFovMultiplier = 1.08;

	private firstPerson = false;

	/** Fires whenever the user changes their first-person state. */
	public readonly firstPersonChanged = new Signal<[isFirstPerson: boolean]>();

	/** Fires before view model updates with position and rotation. Change these values to adjust view model position. */
	public onViewModelUpdate = new Signal<[data: ViewModelUpdate]>();

	private fps?: FirstPersonCameraSystem;
	public humanoidCameraMode: HumanoidCameraMode | undefined;
	private orbitCameraMode: OrbitCameraMode | undefined;

	private characterCameraMode: CharacterCameraMode = CharacterCameraMode.Orbit;

	private overrideFOV = new Map<CharacterCameraType, number>();

	private firstPersonFOV = 80;
	private thirdPersonFOV = 70;

	constructor() {
		Airship.characterCamera = this;
		if (CameraReferences.Instance().DoesCameraRigExist()) {
			this.cameraSystem = new CameraSystem();
		}
	}

	OnStart(): void {
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
	public SetMode(mode: CameraMode) {
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
		this.cameraSystem?.SetFOV(targetCameraType, fieldOfView, !smooth);
		this.overrideFOV.set(targetCameraType, fieldOfView);
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

		// first person
		{
			let fov = this.overrideFOV.get(CharacterCameraType.FIRST_PERSON) ?? this.firstPersonFOV;
			if (this.characterState?.sprinting) {
				fov *= this.sprintFovMultiplier;
			}
			this.SetFOV(CharacterCameraType.FIRST_PERSON, fov, true);
		}

		// third person
		{
			let fov = this.overrideFOV.get(CharacterCameraType.THIRD_PERSON) ?? this.thirdPersonFOV;
			if (this.characterState?.sprinting) {
				fov *= this.sprintFovMultiplier;
			}
			this.SetFOV(CharacterCameraType.THIRD_PERSON, fov, true);
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
		const cameraSingleton = Dependency<AirshipCharacterCameraSingleton>();
		let currentCleanup: CleanupFunc;

		const onChanged = (isFirstPerson: boolean) => {
			currentCleanup?.();
			currentCleanup = observer(isFirstPerson);
			cameraSingleton.UpdateLocalCharacterState({ firstPerson: true });
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
			this.SetMode(this.CreateHumanoidCameraMode(character));
			this.cameraSystem?.SetOnClearCallback(() => this.CreateHumanoidCameraMode(character));
		} else if (this.characterCameraMode === CharacterCameraMode.Orbit) {
			this.SetMode(this.CreateOrbitCameraMode(character));
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
	public SetupCameraControls(keyboard: Keyboard) {
		// Toggle first person:
		keyboard.OnKeyDown(Key.T, (event) => {
			if (!this.IsEnabled()) return;
			if (event.uiProcessed) return;
			if (!this.canToggleFirstPerson) return;
			if (this.cameraSystem?.GetMode() === this.humanoidCameraMode) {
				this.ToggleFirstPerson();
			}
		});

		// Toggle look backwards:
		keyboard.OnKeyDown(Key.H, (event) => {
			if (!this.IsEnabled()) return;
			if (event.uiProcessed) return;
			if (this.cameraSystem?.GetMode() === this.humanoidCameraMode) {
				this.SetLookBackwards(!this.lookBackwards);
			}
		});

		let flyCam = false;
		const flyingBin = new Bin();

		// Toggle fly cam:
		keyboard.OnKeyDown(Key.P, (event) => {
			if (event.uiProcessed) return;
			if (keyboard.IsKeyDown(Key.LeftShift)) {
				if (flyCam) {
					flyCam = false;
					flyingBin.Clean();
				} else {
					flyCam = true;
					let backToFirstPerson = this.firstPerson;
					if (backToFirstPerson) {
						this.SetFirstPerson(false);
					}
					this.SetMode(new FlyCameraMode());
					flyingBin.Add(() => {
						this.ClearMode();
						if (backToFirstPerson) {
							this.SetFirstPerson(true);
						}
					});
					flyingBin.Add(Dependency<LocalCharacterSingleton>().input!.AddDisabler());
					flyingBin.Add(Airship.inventory.localCharacterInventory.AddDisabler());
				}
			}
		});
	}

	public SetCharacterCameraMode(mode: CharacterCameraMode): void {
		this.characterCameraMode = mode;

		if (Game.localPlayer.character) {
			const character = Game.localPlayer.character;
			if (mode === CharacterCameraMode.Locked) {
				this.SetMode(this.CreateHumanoidCameraMode(character));
			} else if (mode === CharacterCameraMode.Orbit) {
				this.SetMode(this.CreateOrbitCameraMode(character));
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

		if (Dependency<AirshipCharacterCameraSingleton>().cameraSystem?.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode?.SetLookBackwards(this.lookBackwards);
		}
	}

	public ToggleFirstPerson() {
		this.SetFirstPerson(!this.firstPerson);
	}

	/**
	 * Changes the preferred perspective for the local character.
	 *
	 * This will only work if using {@link CharacterCameraMode.Locked}. You can set this with {@link SetCharacterCameraMode()}
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
