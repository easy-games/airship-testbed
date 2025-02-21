import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { AirshipCameraSingleton } from "../../Camera/AirshipCameraSingleton";
import { CharacterInput } from "./CharacterInput";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
@Singleton({
	loadOrder: 10000,
})
export class LocalCharacterSingleton {
	public readonly stateChanged = new Signal<[newState: CharacterState]>();

	private characterMovement: BasicCharacterMovement | undefined;
	private screenshot: CameraScreenshotRecorder | undefined;
	public input: CharacterInput | undefined;
	private prevState: CharacterState = CharacterState.Idle;
	private currentState: CharacterState = CharacterState.Idle;

	private firstSpawn = true;
	private sprintOverlayEmission?: EmissionModule;

	private moveDirWorldSpace = false;
	private movementEnabled = true;

	/**
	 * This can be used to change input before it's processed by the entity system.
	 */
	public readonly onBeforeLocalEntityInput = new Signal<LocalCharacterInputSignal>();

	private TakeScreenshot() {
		// if (!this.screenshot) {
		// 	return;
		// }
		// const clientSettings = Dependency<ClientSettingsController>();
		// const showUI = clientSettings.GetScreenshotShowUI();
		// const supersample = clientSettings.GetScreenshotRenderHD();
		// let screenshotFilename = os.date("Screenshot-%Y-%m-%d-%H-%M-%S");
		// const superSampleSize = supersample ? 4 : 1;
		// print(`Capturing screenshot. UI: ${showUI} Supersample: ${superSampleSize} Name: ${screenshotFilename}`);
		// if (showUI) {
		// 	this.screenshot.TakeScreenshot(screenshotFilename, superSampleSize, true);
		// } else {
		// 	this.screenshot.TakeCameraScreenshot(Camera.main, screenshotFilename, superSampleSize);
		// }
		// if (supersample && !showUI) {
		// 	Game.localPlayer.SendMessage(
		// 		ColorUtil.ColoredText(Theme.red, "HD withoutout UI is currently not supported"),
		// 	);
		// }
		// Game.localPlayer.SendMessage(ColorUtil.ColoredText(Theme.yellow, `Captured screenshot ${screenshotFilename}`));
	}

	OnStart() {
		if (!Game.IsClient()) return;
		Game.localPlayer.ObserveCharacter((character) => {
			if (!character) return;

			this.firstSpawn = false;

			const bin = new Bin();

			this.characterMovement = character.gameObject.GetComponent<BasicCharacterMovement>()!;
			this.input = new CharacterInput(character);

			this.screenshot = character.gameObject.AddComponent<CameraScreenshotRecorder>();

			// Set up camera
			const cameraController = Dependency<AirshipCameraSingleton>();
			cameraController.SetupCamera(character);
			cameraController.SetupCameraControls(bin);

			if (this.characterMovement) {
				const stateChangedConn = this.characterMovement.OnStateChanged((state) => {
					if (state !== this.currentState) {
						this.prevState = this.currentState;
						this.currentState = state;
						this.stateChanged.Fire(state);
					}
					if (this.sprintOverlayEmission) {
						this.sprintOverlayEmission.enabled = state === CharacterState.Sprinting;
					}
				});
				bin.Add(() => {
					Bridge.DisconnectEvent(stateChangedConn);
				});
			}

			// Pause Editor
			bin.Add(
				Keyboard.OnKeyDown(Key.F1, (event) => {
					if (event.uiProcessed) return;
					if (Keyboard.IsKeyDown(Key.LeftShift)) {
						GizmoUtils.TogglePauseEngine();
					}
				}),
			);
			Keyboard.OnKeyDown(Key.Backquote, (event) => {
				if (event.uiProcessed) return;
				if (Keyboard.IsKeyDown(Key.LeftShift)) {
					GizmoUtils.TogglePauseEngine();
				}
			});

			// Screenshot:
			bin.Add(
				Keyboard.OnKeyDown(Key.F2, (event) => {
					if (event.uiProcessed) return;
					this.TakeScreenshot();
				}),
			);

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
					// If the camera mode's target is _not_ the local character don't
					// clean up camera.
					const mode = cameraController.GetMode();
					if (mode) {
						const target = mode.GetTarget();
						const isTargetLocalCharacter = target === character.model;
						if (!isTargetLocalCharacter) return;
					}
					cameraController.CleanupCamera();
				}
			});

			bin.Add(() => {
				this.input?.Destroy();
			});

			character.onDeath.Connect(() => {
				bin.Clean();
			});

			return () => {
				bin.Clean();
			};
		});

		{
			let disablers = new Map<number, () => void>();
			let idCounter = 0;
			contextbridge.callback<() => number | undefined>("LocalCharacterSingleton:AddInputDisabler", () => {
				const cleanup = this.GetCharacterInput()?.AddDisabler();
				if (cleanup !== undefined) {
					idCounter++;
					const id = idCounter;
					disablers.set(id, cleanup);
					return id;
				}
			});
			contextbridge.callback<(from: LuauContext, id: number) => void>(
				"LocalCharacterSingleton:RemoveInputDisabler",
				(from, id) => {
					const cleanup = disablers.get(id);
					if (cleanup !== undefined) {
						cleanup();
						disablers.delete(id);
					}
				},
			);
		}

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

	public GetCharacterInput(): CharacterInput | undefined {
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

	public SetDefaultMovementEnabled(enabled: boolean) {
		this.movementEnabled = enabled;
	}

	public IsDefaultMovementEnabled() {
		return this.movementEnabled;
	}

	public IsMoveDirWorldSpace(): boolean {
		return this.moveDirWorldSpace;
	}

	/**
	 * @internal
	 */
	public GetEntityDriver() {
		return this.characterMovement;
	}
}
