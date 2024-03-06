import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { Controller, Dependency, OnStart } from "Shared/Flamework";
import { Game } from "Shared/Game";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { Theme } from "Shared/Util/Theme";
import { CameraController } from "../../../Client/Controllers/Camera/CameraController";
import { FlyCameraMode } from "../../../Client/Controllers/Camera/DefaultCameraModes/FlyCameraMode";
import { HumanoidCameraMode } from "../../../Client/Controllers/Camera/DefaultCameraModes/HumanoidCameraMode";
import { OrbitCameraMode } from "../../../Client/Controllers/Camera/DefaultCameraModes/OrbitCameraMode";
import { FirstPersonCameraSystem } from "../../../Client/Controllers/Camera/FirstPersonCameraSystem";
import { ClientSettingsController } from "../../../Client/MainMenuControllers/Settings/ClientSettingsController";
import { CharacterCameraMode } from "./CharacterCameraMode";
import { CharacterInput } from "./CharacterInput";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";

const CAM_Y_OFFSET = 1.7;
const CAM_Y_OFFSET_CROUCH_1ST_PERSON = CAM_Y_OFFSET / 1.5;
const CAM_Y_OFFSET_CROUCH_3RD_PERSON = CAM_Y_OFFSET;

@Controller({
	loadOrder: 10000,
})
export class LocalCharacterSingleton implements OnStart {
	private firstPerson = false;
	private lookBackwards = false;
	private fps?: FirstPersonCameraSystem;

	/** Fires whenever the user changes their first-person state. */
	public readonly firstPersonChanged = new Signal<[isFirstPerson: boolean]>();

	/** Fires whenever the user requests to look (or stop looking) backwards. */
	public readonly lookBackwardsChanged = new Signal<[lookBackwards: boolean]>();

	private customDataQueue: { key: unknown; value: unknown }[] = [];

	private entityDriver: CharacterMovement | undefined;
	private screenshot: CameraScreenshotRecorder | undefined;
	public input: CharacterInput | undefined;
	private prevState: CharacterState = CharacterState.Idle;
	private currentState: CharacterState = CharacterState.Idle;
	public humanoidCameraMode: HumanoidCameraMode | undefined;
	private orbitCameraMode: OrbitCameraMode | undefined;

	private characterCameraMode: CharacterCameraMode = CharacterCameraMode.Orbit;
	private firstSpawn = true;
	private sprintOverlayEmission?: EmissionModule;

	private moveDirWorldSpace = false;

	public readonly onCustomMoveDataProcessed = new Signal<void>();

	/**
	 * This can be used to change input before it's processed by the entity system.
	 */
	public readonly onBeforeLocalEntityInput = new Signal<LocalCharacterInputSignal>();

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
			this.UpdateFov();
		};

		const disconnect = this.firstPersonChanged.Connect(onChanged);
		onChanged(this.firstPerson);

		return () => {
			disconnect();
			currentCleanup?.();
		};
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

	/** Add custom data to the move data command stream. */
	public AddToMoveData(
		key: string,
		value: unknown,
		/**
		 * Fired when the move data has been processed during the tick loop.
		 * This will be fired **before** movement is calculated.
		 **/
		onProcessedCallback?: () => void,
	) {
		this.customDataQueue.push({ key, value });
		const blob = new BinaryBlob(this.customDataQueue);
		this.entityDriver?.SetCustomData(blob);

		if (onProcessedCallback !== undefined) {
			this.onCustomMoveDataProcessed.Once(onProcessedCallback);
		}
	}

	private TakeScreenshot() {
		if (!this.screenshot) {
			return;
		}
		const clientSettings = Dependency<ClientSettingsController>();
		const showUI = clientSettings.GetScreenshotShowUI();
		const supersample = clientSettings.GetScreenshotRenderHD();
		let screenshotFilename = os.date("Screenshot-%Y-%m-%d-%H-%M-%S");
		const superSampleSize = supersample ? 4 : 1;
		print(`Capturing screenshot. UI: ${showUI} Supersample: ${superSampleSize} Name: ${screenshotFilename}`);
		if (showUI) {
			this.screenshot.TakeScreenshot(screenshotFilename, superSampleSize);
		} else {
			this.screenshot.TakeCameraScreenshot(Camera.main, screenshotFilename, superSampleSize);
		}
		if (supersample && !showUI) {
			Game.localPlayer.SendMessage(
				ColorUtil.ColoredText(Theme.red, "HD withoutout UI is currently not supported"),
			);
		}
		Game.localPlayer.SendMessage(ColorUtil.ColoredText(Theme.yellow, `Captured screenshot ${screenshotFilename}`));
	}

	private GetCamYOffset(state: CharacterState, isFirstPerson: boolean) {
		const yOffset =
			state === CharacterState.Crouching || state === CharacterState.Sliding
				? isFirstPerson
					? CAM_Y_OFFSET_CROUCH_1ST_PERSON
					: CAM_Y_OFFSET_CROUCH_3RD_PERSON
				: CAM_Y_OFFSET;
		return yOffset;
	}

	private CreateHumanoidCameraMode(character: Character): HumanoidCameraMode {
		const state = this.entityDriver?.GetState() ?? CharacterState.Idle;
		const yOffset = this.GetCamYOffset(state, this.firstPerson);
		this.humanoidCameraMode = new HumanoidCameraMode(character, character.model, this.firstPerson, yOffset);
		this.humanoidCameraMode.SetLookBackwards(this.lookBackwards);
		this.humanoidCameraMode.SetFirstPerson(this.firstPerson);
		return this.humanoidCameraMode;
	}

	private CreateOrbitCameraMode(character: Character): OrbitCameraMode {
		return new OrbitCameraMode(4, character.gameObject.transform, character.model.transform);
	}

	OnStart() {
		if (!RunUtil.IsClient()) return;
		Game.localPlayer.ObserveCharacter((character) => {
			if (!character) return;

			this.firstSpawn = false;

			const bin = new Bin();
			const keyboard = bin.Add(new Keyboard());

			this.entityDriver = character.gameObject.GetComponent<CharacterMovement>();
			this.input = new CharacterInput(character);

			this.screenshot = character.gameObject.AddComponent<CameraScreenshotRecorder>();

			const customDataFlushedConn = this.entityDriver.OnCustomDataFlushed(() => {
				this.customDataQueue.clear();
				this.onCustomMoveDataProcessed.Fire();
			});
			bin.Add(() => {
				Bridge.DisconnectEvent(customDataFlushedConn);
			});

			// Set up camera
			const cameraController = Dependency<CameraController>();
			if (this.characterCameraMode === CharacterCameraMode.Locked) {
				cameraController.SetMode(this.CreateHumanoidCameraMode(character));
				cameraController.cameraSystem?.SetOnClearCallback(() => this.CreateHumanoidCameraMode(character));
			} else if (this.characterCameraMode === CharacterCameraMode.Orbit) {
				cameraController.SetMode(this.CreateOrbitCameraMode(character));
				cameraController.cameraSystem?.SetOnClearCallback(() => this.CreateOrbitCameraMode(character));
			}

			this.firstPersonChanged.Connect((isFirstPerson) => {
				this.humanoidCameraMode?.SetYOffset(
					this.GetCamYOffset(this.entityDriver?.GetState() ?? CharacterState.Idle, isFirstPerson),
					true,
				);
			});

			//Set up first person camera
			this.fps = new FirstPersonCameraSystem(character, this.firstPerson);

			const stateChangedConn = this.entityDriver.OnStateChanged((state) => {
				if (state !== this.currentState) {
					this.prevState = this.currentState;
					this.currentState = state;
				}
				this.humanoidCameraMode?.SetYOffset(this.GetCamYOffset(state, this.firstPerson));
				this.UpdateFov();
				this.fps?.OnMovementStateChange(state);
				if (this.sprintOverlayEmission) {
					this.sprintOverlayEmission.enabled =
						state === CharacterState.Sprinting || state === CharacterState.Sliding;
				}
			});
			bin.Add(() => {
				Bridge.DisconnectEvent(stateChangedConn);
			});

			let flyCam = false;

			const flyingBin = new Bin();

			// Pause Editor
			keyboard.OnKeyDown(KeyCode.F1, (event) => {
				if (event.uiProcessed) return;
				if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
					DebugUtil.TogglePauseEngine();
				}
			});
			keyboard.OnKeyDown(KeyCode.BackQuote, (event) => {
				if (event.uiProcessed) return;
				if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
					DebugUtil.TogglePauseEngine();
				}
			});

			// Toggle first person:
			keyboard.OnKeyDown(KeyCode.T, (event) => {
				if (!cameraController.IsEnabled()) return;
				if (event.uiProcessed) return;
				if (cameraController.cameraSystem?.GetMode() === this.humanoidCameraMode) {
					this.ToggleFirstPerson();
				}
			});

			// Toggle fly cam:
			keyboard.OnKeyDown(KeyCode.P, (event) => {
				if (event.uiProcessed) return;
				if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
					if (flyCam) {
						flyCam = false;
						flyingBin.Clean();
					} else {
						flyCam = true;
						let backToFirstPerson = this.firstPerson;
						if (backToFirstPerson) {
							this.SetFirstPerson(false);
						}
						cameraController.SetMode(new FlyCameraMode());
						flyingBin.Add(() => {
							cameraController.ClearMode();
							if (backToFirstPerson) {
								this.SetFirstPerson(true);
							}
						});
						flyingBin.Add(this.input!.AddDisabler());
						flyingBin.Add(Airship.inventory.localCharacterInventory.AddDisabler());
					}
				}
			});

			// Toggle fly mode (like mc creative):
			let lastSpace = 0;
			keyboard.OnKeyDown(KeyCode.Space, (event) => {
				if (event.uiProcessed) return;
				const now = Time.time;
				const dt = now - lastSpace;
				if (dt < 0.3) {
					lastSpace = 0;
					if (this.entityDriver?.IsAllowFlight()) {
						this.entityDriver?.SetFlying(!this.entityDriver.IsFlying());
					}
				} else {
					lastSpace = now;
				}
			});

			// Toggle look backwards:
			keyboard.OnKeyDown(KeyCode.H, (event) => {
				if (event.uiProcessed) return;
				if (cameraController.cameraSystem?.GetMode() === this.humanoidCameraMode) {
					this.SetLookBackwards(!this.lookBackwards);
				}
			});

			// Screenshot:
			keyboard.OnKeyDown(KeyCode.F2, (event) => {
				if (event.uiProcessed) return;
				this.TakeScreenshot();
			});

			// keyboard.OnKeyDown(KeyCode.Semicolon, (event) => {
			// 	CoreNetwork.ClientToServer.TestKnockback2.client.FireServer();
			// });

			//Libonati Test Space - DONT COMMIT
			/*keyboard.OnKeyDown(KeyCode.G, (event) => {
				print("Sending Libonati Debug Command");
				CoreNetwork.ClientToServer.LibonatiTest.Client.FireServer();
			});*/

			// Cleanup:
			bin.Add(() => {
				if (cameraController.IsEnabled()) {
					cameraController.cameraSystem?.SetOnClearCallback(undefined);
					cameraController.ClearMode();
				}
				this.fps?.Destroy();
				this.input?.Destroy();
			});

			character.onDeath.Connect(() => {
				bin.Clean();
			});

			return () => {
				bin.Clean();
			};
		});

		//Sprinting overlay vfx
		// let sprintOverlaytemplate = AssetBridge.Instance.LoadAssetIfExists<GameObject>(
		// 	AllBundleItems.Entity_Movement_SprintOverlayVFX,
		// );
		// if (sprintOverlaytemplate) {
		// 	let sprintOverlayGameObject = GameObjectUtil.Instantiate(sprintOverlaytemplate);
		// 	sprintOverlayGameObject.transform.SetParent(CameraReferences.Instance().mainCamera.transform, false);
		// 	this.sprintOverlayEmission = sprintOverlayGameObject
		// 		.GetComponentsInChildren<ParticleSystem>()
		// 		?.GetValue(0).emission;
		// }
	}

	public SetCharacterCameraMode(mode: CharacterCameraMode): void {
		this.characterCameraMode = mode;

		if (Game.localPlayer.character) {
			const character = Game.localPlayer.character;
			const cameraController = Dependency<CameraController>();
			if (mode === CharacterCameraMode.Locked) {
				cameraController.SetMode(this.CreateHumanoidCameraMode(character));
			} else if (mode === CharacterCameraMode.Orbit) {
				cameraController.SetMode(this.CreateOrbitCameraMode(character));
			}
		}

		if (mode !== CharacterCameraMode.Locked) {
			this.firstPerson = false;
		}
	}

	public UpdateFov(): void {
		const cameraController = Dependency<CameraController>();
		if (!cameraController.IsEnabled()) return;

		const clientSettings = Dependency<ClientSettingsController>();
		let baseFov = this.IsFirstPerson() ? clientSettings.GetFirstPersonFov() : clientSettings.GetThirdPersonFov();
		if (
			this.currentState === CharacterState.Sprinting ||
			this.currentState === CharacterState.Sliding ||
			this.input?.IsSprinting()
			// (this.currentState === EntityState.Jumping && this.prevState === EntityState.Sprinting)
		) {
			cameraController.SetFOV(baseFov * 1.08, false);
		} else {
			cameraController.SetFOV(baseFov, false);
		}
		// cameraController.SetFOV(baseFov, false);
	}

	private SetLookBackwards(lookBackwards: boolean) {
		if (this.lookBackwards === lookBackwards) return;
		this.lookBackwards = lookBackwards;
		this.lookBackwardsChanged.Fire(this.lookBackwards);

		if (Dependency<CameraController>().cameraSystem?.GetMode() === this.humanoidCameraMode) {
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

		if (Dependency<CameraController>().cameraSystem?.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode?.SetFirstPerson(this.firstPerson);
		}
		this.fps?.OnFirstPersonChanged(this.firstPerson);
	}

	public GetEntityInput(): CharacterInput | undefined {
		return this.input;
	}

	/**
	 * When set to true, the move input will always make "W" point north, "A" west, etc.
	 *
	 * The default value is false.
	 * @param worldSpace True if should use world space. False if should use local space.
	 */
	public SetMoveDirWorldSpace(worldSpace: boolean): void {
		this.moveDirWorldSpace = worldSpace;
	}

	public IsMoveDirWorldSpace(): boolean {
		return this.moveDirWorldSpace;
	}
}
