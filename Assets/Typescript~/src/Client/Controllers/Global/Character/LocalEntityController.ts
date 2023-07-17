import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { Network } from "Shared/Network";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { DataStreamItems } from "Shared/Util/DataStreamTypes";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { CameraController } from "../Camera/CameraController";
import { HumanoidCameraMode } from "../Camera/DefaultCameraModes/HumanoidCameraMode";
import { FirstPersonCameraSystem } from "../Camera/FirstPersonCameraSystem";
import { ClientSettingsController } from "../CollectionManager/ClientSettingsController";
import { EntityController } from "../Entity/EntityController";
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
	private entityInput: EntityInput | undefined;
	private prevState: EntityState = EntityState.Idle;
	private currentState: EntityState = EntityState.Idle;

	constructor(
		private readonly cameraController: CameraController,
		private readonly clientSettings: ClientSettingsController,
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

	private TakeScreenshot() {
		let screenshotFilename = os.date("Screenshot-%Y-%m-%d-%H-%M-%S.png");
		print(`Capturing screenshot ${screenshotFilename}`);
		ScreenCapture.CaptureScreenshot(screenshotFilename);
	}

	OnStart() {
		Game.LocalPlayer.ObserveCharacter((entity) => {
			if (!entity) return;

			const bin = new Bin();

			const keyboard = bin.Add(new Keyboard());

			this.entityDriver = entity.gameObject.GetComponent<EntityDriver>();
			this.entityInput = new EntityInput(entity.gameObject);

			let humanoidCameraMode: HumanoidCameraMode;

			// Custom move data control:
			// bin.Add(
			// 	OnUpdate.ConnectWithPriority(SignalPriority.MONITOR, () => {
			// 		print("LocalEntityController.ts update");
			// 		if (this.customDataQueue.size() === 0) return;
			// 		const blob = new BinaryBlob(this.customDataQueue);
			// 		print("[TS]: SetCustomData()");
			// 		entityDriver.SetCustomData(blob);
			// 	}),
			// );
			this.entityDriver.OnCustomDataFlushed(() => {
				this.customDataQueue.clear();
			});

			const getCamYOffset = (state: EntityState, isFirstPerson: boolean) => {
				const yOffset =
					state === EntityState.Crouching || state === EntityState.Sliding
						? isFirstPerson
							? CAM_Y_OFFSET_CROUCH_1ST_PERSON
							: CAM_Y_OFFSET_CROUCH_3RD_PERSON
						: CAM_Y_OFFSET;
				return yOffset;
			};

			// Set up camera
			const createHumanoidCameraMode = () => {
				const state = this.entityDriver?.GetState() ?? EntityState.Idle;
				const yOffset = getCamYOffset(state, this.firstPerson);
				humanoidCameraMode = new HumanoidCameraMode(entity.gameObject, entity.model, this.firstPerson, yOffset);
				humanoidCameraMode.SetLookBackwards(this.lookBackwards);
				return humanoidCameraMode;
			};

			this.FirstPersonChanged.Connect((isFirstPerson) => {
				humanoidCameraMode.SetYOffset(
					getCamYOffset(this.entityDriver?.GetState() ?? EntityState.Idle, isFirstPerson),
					true,
				);
			});

			//Set up first person camera
			this.fps = new FirstPersonCameraSystem(entity.references, entity.dynamicVariables);
			this.fps.OnFirstPersonChanged(this.firstPerson);

			this.cameraController.SetMode(createHumanoidCameraMode());
			this.cameraController.cameraSystem.SetOnClearCallback(createHumanoidCameraMode);

			this.entityDriver.OnStateChanged((state) => {
				if (state !== this.currentState) {
					this.prevState = this.currentState;
					this.currentState = state;
				}
				humanoidCameraMode.SetYOffset(getCamYOffset(state, this.firstPerson));
				this.UpdateFov();
			});

			let flyCam = false;

			const flyingBin = new Bin();

			// Toggle first person:
			keyboard.OnKeyDown(KeyCode.T, (event) => {
				if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
					this.ToggleFirstPerson(humanoidCameraMode);
				}
			});

			// Toggle look backwards:
			keyboard.OnKeyDown(KeyCode.LeftAlt, (event) => {
				if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
					this.SetLookBackwards(humanoidCameraMode, true);
				}
			});
			keyboard.OnKeyUp(KeyCode.LeftAlt, (event) => {
				if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
					this.SetLookBackwards(humanoidCameraMode, false);
				}
			});

			// Screenshot:
			keyboard.OnKeyDown(KeyCode.M, (event) => {
				if (keyboard.IsKeyDown(KeyCode.LeftShift)) {
					this.TakeScreenshot();
				}
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
					const halfWay = Network.ClientToServer.TEST_LATENCY.Client.FireServer();
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

			// bin.Connect(keyboard.KeyDown, (event) => {
			// 	// Toggle first-person view:
			// 	if (event.Key === Key.T) {
			// 		if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
			// 			this.ToggleFirstPerson(humanoidCameraMode);
			// 		}
			// 	} else if (event.Key === Key.LeftAlt) {
			// 		if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
			// 			this.SetLookBackwards(humanoidCameraMode, true);
			// 		}
			// 	} else if (event.Key === Key.P && keyboard.IsKeyDown(Key.LeftShift)) {
			// 		if (RunCore.IsEditor()) {
			// 			flyCam = !flyCam;
			// 			if (flyCam) {
			// 				if (this.entityInput) {
			// 					flyingBin.Add(this.entityInput.AddDisabler());
			// 				}
			// 				this.cameraController.SetMode(new FlyCameraMode());
			// 			} else {
			// 				flyingBin.Clean();
			// 				this.cameraController.ClearMode();
			// 			}
			// 		}
			// 	} else if (event.Key === Key.M && keyboard.IsKeyDown(Key.LeftShift)) {
			// 		this.TakeScreenshot();
			// 	} else if (event.Key === Key.L) {
			// 		print("-----");
			// 		for (const entity of Dependency<EntityController>().GetEntities()) {
			// 			print(entity.GetDisplayName() + ": " + entity.id);
			// 		}
			// 		print("-----");
			// 		// TEST: Knock-back:
			// 		Task.Spawn(() => {
			// 			const sentTick = InstanceFinder.TimeManager.Tick;
			// 			const halfWay = Network.ClientToServer.TEST_LATENCY.Client.FireServer();
			// 			const endTick = InstanceFinder.TimeManager.Tick;
			// 			print(
			// 				"Round trip: " +
			// 					(endTick - sentTick) +
			// 					" | trip 1: " +
			// 					(halfWay - sentTick) +
			// 					" | trip 2: " +
			// 					(endTick - halfWay),
			// 			);
			// 		});
			// 	}
			// });

			// bin.Connect(keyboard.KeyUp, (event) => {
			// 	if (event.Key === Key.LeftAlt) {
			// 		if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
			// 			this.SetLookBackwards(humanoidCameraMode, false);
			// 		}
			// 	}
			// });

			// Cleanup:
			bin.Add(() => {
				this.cameraController.cameraSystem.SetOnClearCallback(undefined);
				this.cameraController.ClearMode();
				this.fps?.Destroy();
				this.entityInput?.Destroy();
			});

			return () => {
				bin.Clean();
			};
		});
	}

	public UpdateFov(): void {
		let baseFov = this.IsFirstPerson()
			? this.clientSettings.GetFirstPersonFov()
			: this.clientSettings.GetThirdPersonFov();
		if (
			this.currentState === EntityState.Sprinting ||
			this.currentState === EntityState.Sliding ||
			(this.currentState === EntityState.Jumping && this.prevState === EntityState.Sprinting)
		) {
			this.cameraController.SetFOV(baseFov * 1.08, false);
		} else {
			this.cameraController.SetFOV(baseFov, false);
		}
	}

	private SetLookBackwards(humanoidCameraMode: HumanoidCameraMode, lookBackwards: boolean) {
		if (this.lookBackwards === lookBackwards) return;
		this.lookBackwards = lookBackwards;
		this.LookBackwardsChanged.Fire(this.lookBackwards);

		if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
			humanoidCameraMode.SetLookBackwards(this.lookBackwards);
		}
	}

	private ToggleFirstPerson(humanoidCameraMode: HumanoidCameraMode) {
		this.firstPerson = !this.firstPerson;
		this.FirstPersonChanged.Fire(this.firstPerson);

		if (this.cameraController.cameraSystem.GetMode() === humanoidCameraMode) {
			humanoidCameraMode.SetFirstPerson(this.firstPerson);
		}
		this.fps?.OnFirstPersonChanged(this.firstPerson);
	}

	public GetEntityInput(): EntityInput | undefined {
		return this.entityInput;
	}
}
