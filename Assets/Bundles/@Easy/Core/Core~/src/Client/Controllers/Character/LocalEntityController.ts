import { Controller, OnStart } from "@easy-games/flamework-core";
import Character from "Shared/Character/Character";
import { Game } from "Shared/Game";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { DataStreamItems } from "Shared/Util/DataStreamTypes";
import { Signal } from "Shared/Util/Signal";
import { Theme } from "Shared/Util/Theme";
import { ClientSettingsController } from "../../MainMenuControllers/Settings/ClientSettingsController";
import { CameraController } from "../Camera/CameraController";
import { FlyCameraMode } from "../Camera/DefaultCameraModes/FlyCameraMode";
import { HumanoidCameraMode } from "../Camera/DefaultCameraModes/HumanoidCameraMode";
import { OrbitCameraMode } from "../Camera/DefaultCameraModes/OrbitCameraMode";
import { FirstPersonCameraSystem } from "../Camera/FirstPersonCameraSystem";
import { InventoryController } from "../Inventory/InventoryController";
import { CharacterCameraMode } from "./CharacterCameraMode";
import { EntityInput } from "./EntityInput";
import { LocalEntityInputSignal } from "./LocalEntityInputSignal";

const CAM_Y_OFFSET = 1.7;
const CAM_Y_OFFSET_CROUCH_1ST_PERSON = CAM_Y_OFFSET / 1.5;
const CAM_Y_OFFSET_CROUCH_3RD_PERSON = CAM_Y_OFFSET;

@Controller({
	loadOrder: 10000,
})
export class LocalEntityController implements OnStart {
	private firstPerson = false;
	private lookBackwards = false;
	private fps?: FirstPersonCameraSystem;

	/** Fires whenever the user changes their first-person state. */
	public readonly firstPersonChanged = new Signal<[isFirstPerson: boolean]>();

	/** Fires whenever the user requests to look (or stop looking) backwards. */
	public readonly lookBackwardsChanged = new Signal<[lookBackwards: boolean]>();

	private customDataQueue: { key: keyof DataStreamItems; value: unknown }[] = [];

	private entityDriver: CharacterMovement | undefined;
	private screenshot: CameraScreenshotRecorder | undefined;
	public entityInput: EntityInput | undefined;
	private prevState: CharacterState = CharacterState.Idle;
	private currentState: CharacterState = CharacterState.Idle;
	public humanoidCameraMode: HumanoidCameraMode | undefined;
	private orbitCameraMode: OrbitCameraMode | undefined;

	private characterCameraMode: CharacterCameraMode = CharacterCameraMode.ORBIT;
	private defaultFirstPerson = false;
	private firstSpawn = true;
	private sprintOverlayEmission?: EmissionModule;

	private moveDirWorldSpace = false;

	public readonly onCustomMoveDataProcessed = new Signal<void>();

	/**
	 * This can be used to change input before it's processed by the entity system.
	 */
	public readonly onBeforeLocalEntityInput = new Signal<LocalEntityInputSignal>();

	constructor(
		private readonly cameraController: CameraController,
		private readonly clientSettings: ClientSettingsController,
		private readonly inventoryController: InventoryController,
	) {}

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
	public AddToMoveData<K extends keyof DataStreamItems, T extends DataStreamItems[K]>(
		key: K,
		value: T,
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
		const showUI = this.clientSettings.GetScreenshotShowUI();
		const supersample = this.clientSettings.GetScreenshotRenderHD();
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
		this.humanoidCameraMode = new HumanoidCameraMode(
			character.gameObject,
			character.model,
			this.firstPerson,
			yOffset,
		);
		this.humanoidCameraMode.SetLookBackwards(this.lookBackwards);
		this.humanoidCameraMode.SetFirstPerson(this.firstPerson);
		return this.humanoidCameraMode;
	}

	private CreateOrbitCameraMode(character: Character): OrbitCameraMode {
		return new OrbitCameraMode(4, character.gameObject.transform, character.model.transform);
	}

	OnStart() {
		Game.localPlayer.ObserveCharacter((entity) => {
			if (!entity) return;

			const isFirstSpawn = this.firstSpawn;
			this.firstSpawn = false;

			const bin = new Bin();
			const keyboard = bin.Add(new Keyboard());
			if (isFirstSpawn) {
				this.firstPerson = this.defaultFirstPerson;
			}

			this.entityDriver = entity.gameObject.GetComponent<CharacterMovement>();
			this.entityInput = new EntityInput(entity);

			this.screenshot = entity.gameObject.AddComponent<CameraScreenshotRecorder>();

			const customDataFlushedConn = this.entityDriver.OnCustomDataFlushed(() => {
				this.customDataQueue.clear();
				this.onCustomMoveDataProcessed.Fire();
			});
			bin.Add(() => {
				Bridge.DisconnectEvent(customDataFlushedConn);
			});

			// Set up camera
			if (this.characterCameraMode === CharacterCameraMode.LOCKED) {
				this.cameraController.SetMode(this.CreateHumanoidCameraMode(entity));
				this.cameraController.cameraSystem?.SetOnClearCallback(() => this.CreateHumanoidCameraMode(entity));
			} else if (this.characterCameraMode === CharacterCameraMode.ORBIT) {
				this.cameraController.SetMode(this.CreateOrbitCameraMode(entity));
				this.cameraController.cameraSystem?.SetOnClearCallback(() => this.CreateOrbitCameraMode(entity));
			}

			this.firstPersonChanged.Connect((isFirstPerson) => {
				this.humanoidCameraMode?.SetYOffset(
					this.GetCamYOffset(this.entityDriver?.GetState() ?? CharacterState.Idle, isFirstPerson),
					true,
				);
			});

			//Set up first person camera
			this.fps = new FirstPersonCameraSystem(entity, this.firstPerson);

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
				if (!this.cameraController.IsEnabled()) return;
				if (event.uiProcessed) return;
				if (this.cameraController.cameraSystem?.GetMode() === this.humanoidCameraMode) {
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
						this.cameraController.SetMode(new FlyCameraMode());
						flyingBin.Add(() => {
							this.cameraController.ClearMode();
							if (backToFirstPerson) {
								this.SetFirstPerson(true);
							}
						});
						flyingBin.Add(this.entityInput!.AddDisabler());
						flyingBin.Add(this.inventoryController.AddDisabler());
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
				if (this.cameraController.cameraSystem?.GetMode() === this.humanoidCameraMode) {
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
				if (this.cameraController.IsEnabled()) {
					this.cameraController.cameraSystem?.SetOnClearCallback(undefined);
					this.cameraController.ClearMode();
				}
				this.fps?.Destroy();
				this.entityInput?.Destroy();
			});

			entity.onDeath.Connect(() => {
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
			const entity = Game.localPlayer.character;
			if (mode === CharacterCameraMode.LOCKED) {
				this.cameraController.SetMode(this.CreateHumanoidCameraMode(entity));
			} else if (mode === CharacterCameraMode.ORBIT) {
				this.cameraController.SetMode(this.CreateOrbitCameraMode(entity));
			}
		}
	}

	public UpdateFov(): void {
		if (!this.cameraController.IsEnabled()) return;
		let baseFov = this.IsFirstPerson()
			? this.clientSettings.GetFirstPersonFov()
			: this.clientSettings.GetThirdPersonFov();
		if (
			this.currentState === CharacterState.Sprinting ||
			this.currentState === CharacterState.Sliding ||
			this.entityInput?.IsSprinting()
			// (this.currentState === EntityState.Jumping && this.prevState === EntityState.Sprinting)
		) {
			this.cameraController.SetFOV(baseFov * 1.08, false);
		} else {
			this.cameraController.SetFOV(baseFov, false);
		}
		// this.cameraController.SetFOV(baseFov, false);
	}

	private SetLookBackwards(lookBackwards: boolean) {
		if (this.lookBackwards === lookBackwards) return;
		this.lookBackwards = lookBackwards;
		this.lookBackwardsChanged.Fire(this.lookBackwards);

		if (this.cameraController.cameraSystem?.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode?.SetLookBackwards(this.lookBackwards);
		}
	}

	public ToggleFirstPerson() {
		this.SetFirstPerson(!this.firstPerson);
	}

	public SetFirstPerson(value: boolean) {
		if (this.firstPerson === value) {
			return;
		}

		this.firstPerson = value;
		this.firstPersonChanged.Fire(this.firstPerson);

		if (this.cameraController.cameraSystem?.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode?.SetFirstPerson(this.firstPerson);
		}
		this.fps?.OnFirstPersonChanged(this.firstPerson);
	}

	public GetEntityInput(): EntityInput | undefined {
		return this.entityInput;
	}

	public SetDefaultFirstPerson(val: boolean): void {
		this.defaultFirstPerson = val;
	}

	public IsDefaultFirstPerson(): boolean {
		return this.defaultFirstPerson;
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
