import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { DataStreamItems } from "Shared/Util/DataStreamTypes";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { Theme } from "Shared/Util/Theme";
import { ClientSettingsController } from "../../MainMenuControllers/Settings/ClientSettingsController";
import { CameraController } from "../Camera/CameraController";
import { FlyCameraMode } from "../Camera/DefaultCameraModes/FlyCameraMode";
import { HumanoidCameraMode } from "../Camera/DefaultCameraModes/HumanoidCameraMode";
import { OrbitCameraMode } from "../Camera/DefaultCameraModes/OrbitCameraMode";
import { FirstPersonCameraSystem } from "../Camera/FirstPersonCameraSystem";
import { EntityController } from "../Entity/EntityController";
import { InventoryController } from "../Inventory/InventoryController";
import { CharacterCameraMode } from "./CharacterCameraMode";
import { EntityInput } from "./EntityInput";

const CAM_Y_OFFSET = 1.7;
const CAM_Y_OFFSET_CROUCH_1ST_PERSON = CAM_Y_OFFSET / 1.5;
const CAM_Y_OFFSET_CROUCH_3RD_PERSON = CAM_Y_OFFSET;

@Controller({
	loadOrder: 10000,
})
export class LocalEntityController implements OnStart {
	private firstPerson = true;
	private lookBackwards = false;
	private fps?: FirstPersonCameraSystem;

	/** Fires whenever the user changes their first-person state. */
	public readonly FirstPersonChanged = new Signal<[isFirstPerson: boolean]>();

	/** Fires whenever the user requests to look (or stop looking) backwards. */
	public readonly LookBackwardsChanged = new Signal<[lookBackwards: boolean]>();

	private customDataQueue: { key: keyof DataStreamItems; value: unknown }[] = [];

	private entityDriver: EntityDriver | undefined;
	private screenshot: CameraScreenshotRecorder | undefined;
	private entityInput: EntityInput | undefined;
	private prevState: EntityState = EntityState.Idle;
	private currentState: EntityState = EntityState.Idle;
	private humanoidCameraMode: HumanoidCameraMode | undefined;
	private orbitCameraMode: OrbitCameraMode | undefined;

	private characterCameraMode: CharacterCameraMode = CharacterCameraMode.LOCKED;
	private defaultFirstPerson = true;

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

		const disconnect = this.FirstPersonChanged.Connect(onChanged);
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

		const disconnect = this.LookBackwardsChanged.Connect(onChanged);
		onChanged(this.lookBackwards);

		return () => {
			disconnect();
			currentCleanup?.();
		};
	}

	/** Add custom data to the move data command stream. */
	public AddToMoveData<K extends keyof DataStreamItems, T extends DataStreamItems[K]>(key: K, value: T) {
		this.customDataQueue.push({ key, value });
		const blob = new BinaryBlob(this.customDataQueue);
		this.entityDriver?.SetCustomData(blob);
	}

	private TakeScreenshot(showUI: boolean, superSample: boolean) {
		if (!this.screenshot) {
			return;
		}
		let screenshotFilename = os.date("Screenshot-%Y-%m-%d-%H-%M-%S");
		const superSampleSize = superSample ? 4 : 1;
		print(`Capturing screenshot ${screenshotFilename}`);
		if (showUI) {
			this.screenshot.TakeScreenshot(screenshotFilename, superSampleSize);
		} else {
			this.screenshot.TakeCameraScreenshot(
				this.cameraController.cameraSystem.GetActiveCamera(),
				screenshotFilename,
				superSampleSize,
			);
		}
		Game.LocalPlayer.SendMessage(ColorUtil.ColoredText(Theme.Yellow, `Captured screenshot ${screenshotFilename}`));
	}

	private GetCamYOffset(state: EntityState, isFirstPerson: boolean) {
		const yOffset =
			state === EntityState.Crouching || state === EntityState.Sliding
				? isFirstPerson
					? CAM_Y_OFFSET_CROUCH_1ST_PERSON
					: CAM_Y_OFFSET_CROUCH_3RD_PERSON
				: CAM_Y_OFFSET;
		return yOffset;
	}

	private CreateHumanoidCameraMode(entity: Entity): HumanoidCameraMode {
		const state = this.entityDriver?.GetState() ?? EntityState.Idle;
		const yOffset = this.GetCamYOffset(state, this.firstPerson);
		this.humanoidCameraMode = new HumanoidCameraMode(entity.gameObject, entity.model, this.firstPerson, yOffset);
		this.humanoidCameraMode.SetLookBackwards(this.lookBackwards);
		return this.humanoidCameraMode;
	}

	private CreateOrbitCameraMode(entity: Entity): OrbitCameraMode {
		return new OrbitCameraMode(entity.model.transform, 6);
	}

	OnStart() {
		Game.LocalPlayer.ObserveCharacter((entity) => {
			if (!entity) return;

			const bin = new Bin();
			const keyboard = bin.Add(new Keyboard());
			this.firstPerson = this.defaultFirstPerson;

			this.entityDriver = entity.gameObject.GetComponent<EntityDriver>();
			this.entityInput = new EntityInput(entity);

			this.screenshot = entity.gameObject.AddComponent<CameraScreenshotRecorder>();

			this.entityDriver.OnCustomDataFlushed(() => {
				this.customDataQueue.clear();
			});

			// Set up camera
			if (this.characterCameraMode === CharacterCameraMode.LOCKED) {
				this.cameraController.SetMode(this.CreateHumanoidCameraMode(entity));
				this.cameraController.cameraSystem.SetOnClearCallback(() => this.CreateHumanoidCameraMode(entity));
			} else if (this.characterCameraMode === CharacterCameraMode.ORBIT) {
				this.cameraController.SetMode(this.CreateOrbitCameraMode(entity));
				this.cameraController.cameraSystem.SetOnClearCallback(() => this.CreateOrbitCameraMode(entity));
			}

			this.FirstPersonChanged.Connect((isFirstPerson) => {
				this.humanoidCameraMode?.SetYOffset(
					this.GetCamYOffset(this.entityDriver?.GetState() ?? EntityState.Idle, isFirstPerson),
					true,
				);
			});

			//Set up first person camera
			this.fps = new FirstPersonCameraSystem(entity.references, this.firstPerson);

			this.entityDriver.OnStateChanged((state) => {
				if (state !== this.currentState) {
					this.prevState = this.currentState;
					this.currentState = state;
				}
				this.humanoidCameraMode?.SetYOffset(this.GetCamYOffset(state, this.firstPerson));
				this.UpdateFov();
			});

			let flyCam = false;

			const flyingBin = new Bin();

			// Pause Editor
			keyboard.OnKeyDown(KeyCode.Tilde, (event) => {
				DebugUtil.TogglePauseEngine();
			});
			keyboard.OnKeyDown(KeyCode.BackQuote, (event) => {
				DebugUtil.TogglePauseEngine();
			});

			// Toggle first person:
			keyboard.OnKeyDown(KeyCode.T, (event) => {
				if (this.cameraController.cameraSystem.GetMode() === this.humanoidCameraMode) {
					this.ToggleFirstPerson();
				}
			});

			// Toggle fly cam:
			keyboard.OnKeyDown(KeyCode.P, (event) => {
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
			keyboard.OnKeyDown(KeyCode.LeftAlt, (event) => {
				if (this.cameraController.cameraSystem.GetMode() === this.humanoidCameraMode) {
					this.SetLookBackwards(true);
				}
			});
			keyboard.OnKeyUp(KeyCode.LeftAlt, (event) => {
				if (this.cameraController.cameraSystem.GetMode() === this.humanoidCameraMode) {
					this.SetLookBackwards(false);
				}
			});

			// Screenshot:
			keyboard.OnKeyDown(KeyCode.F2, (event) => {
				this.TakeScreenshot(keyboard.IsKeyDown(KeyCode.LeftShift), keyboard.IsKeyDown(KeyCode.LeftControl));
			});

			// Debug knockback:
			keyboard.OnKeyDown(KeyCode.L, (event) => {
				print("-----");
				for (const entity of Dependency<EntityController>().GetEntities()) {
					print(entity.GetDisplayName() + ": " + entity.id);
				}
				print("-----");
				// TEST: Knock-back:
				Task.Spawn(() => {
					const sentTick = InstanceFinder.TimeManager.Tick;
					const halfWay = CoreNetwork.ClientToServer.TEST_LATENCY.Client.FireServer();
					const endTick = InstanceFinder.TimeManager.Tick;
					print(
						"Round trip: " +
							(endTick - sentTick) +
							" | trip 1: " +
							(halfWay - sentTick) +
							" | trip 2: " +
							(endTick - halfWay),
					);
				});
			});

			keyboard.OnKeyDown(KeyCode.Semicolon, (event) => {
				CoreNetwork.ClientToServer.TestKnockback2.Client.FireServer();
			});

			//Libonati Test Space - DONT COMMIT
			keyboard.OnKeyDown(KeyCode.G, (event) => {
				print("Sending Libonati Debug Command");
				CoreNetwork.ClientToServer.LibonatiTest.Client.FireServer();
			});

			// Cleanup:
			bin.Add(() => {
				this.cameraController.cameraSystem.SetOnClearCallback(undefined);
				this.cameraController.ClearMode();
				this.fps?.Destroy();
				this.entityInput?.Destroy();
			});

			entity.OnDeath.Connect(() => {
				bin.Clean();
			});

			return () => {
				bin.Clean();
			};
		});
	}

	public SetCharacterCameraMode(mode: CharacterCameraMode): void {
		this.characterCameraMode = mode;

		if (Game.LocalPlayer.Character) {
			const entity = Game.LocalPlayer.Character;
			if (mode === CharacterCameraMode.LOCKED) {
				this.cameraController.SetMode(this.CreateHumanoidCameraMode(entity));
			} else if (mode === CharacterCameraMode.ORBIT) {
				this.cameraController.SetMode(this.CreateOrbitCameraMode(entity));
			}
		}
	}

	public UpdateFov(): void {
		let baseFov = this.IsFirstPerson()
			? this.clientSettings.GetFirstPersonFov()
			: this.clientSettings.GetThirdPersonFov();
		if (
			// this.currentState === EntityState.Sprinting ||
			this.currentState === EntityState.Sliding
			// (this.currentState === EntityState.Jumping && this.prevState === EntityState.Sprinting)
		) {
			this.cameraController.SetFOV(baseFov * 1.08, false);
		} else {
			this.cameraController.SetFOV(baseFov, false);
		}
	}

	private SetLookBackwards(lookBackwards: boolean) {
		if (this.lookBackwards === lookBackwards) return;
		this.lookBackwards = lookBackwards;
		this.LookBackwardsChanged.Fire(this.lookBackwards);

		if (this.cameraController.cameraSystem.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode.SetLookBackwards(this.lookBackwards);
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
		this.FirstPersonChanged.Fire(this.firstPerson);

		if (this.cameraController.cameraSystem.GetMode() === this.humanoidCameraMode) {
			this.humanoidCameraMode.SetFirstPerson(this.firstPerson);
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
}
