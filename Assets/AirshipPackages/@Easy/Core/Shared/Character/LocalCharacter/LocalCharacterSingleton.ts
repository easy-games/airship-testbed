import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { AirshipCharacterCameraSingleton } from "../../Camera/AirshipCharacterCameraSingleton";
import { CharacterInput } from "./CharacterInput";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
@Singleton({
	loadOrder: 10000,
})
export class LocalCharacterSingleton {
	public readonly stateChanged = new Signal<[newState: CharacterState]>();

	private characterMovement: CharacterMovement | undefined;
	private screenshot: CameraScreenshotRecorder | undefined;
	public input: CharacterInput | undefined;
	private prevState: CharacterState = CharacterState.Idle;
	private currentState: CharacterState = CharacterState.Idle;

	private firstSpawn = true;
	private sprintOverlayEmission?: EmissionModule;

	private moveDirWorldSpace = false;

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
			print("observe character: " + character?.id + " localOwned=" + (character?.IsLocalCharacter() ?? false));
			if (!character) return;

			this.firstSpawn = false;

			const bin = new Bin();

			this.characterMovement = character.gameObject.GetComponent<CharacterMovement>()!;
			this.input = new CharacterInput(character);

			this.screenshot = character.gameObject.AddComponent<CameraScreenshotRecorder>();

			// Set up camera
			const cameraController = Dependency<AirshipCharacterCameraSingleton>();
			cameraController.SetupCamera(character);
			cameraController.SetupCameraControls(bin);

			const stateChangedConn = this.characterMovement.OnStateChanged((state) => {
				if (state !== this.currentState) {
					this.prevState = this.currentState;
					this.currentState = state;
					this.stateChanged.Fire(state);
				}
				if (this.sprintOverlayEmission) {
					this.sprintOverlayEmission.enabled =
						state === CharacterState.Sprinting || state === CharacterState.Sliding;
				}
			});
			bin.Add(() => {
				Bridge.DisconnectEvent(stateChangedConn);
			});

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

			// Toggle fly mode (like mc creative):
			let lastSpace = 0;
			bin.Add(
				Keyboard.OnKeyDown(Key.Space, (event) => {
					if (event.uiProcessed) return;
					const now = Time.time;
					const dt = now - lastSpace;
					if (dt < 0.3) {
						lastSpace = 0;
						if (this.characterMovement?.IsAllowFlight()) {
							this.characterMovement?.SetFlying(!this.characterMovement.IsFlying());
						}
					} else {
						lastSpace = now;
					}
				}),
			);

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
					cameraController.CleanupCamera();
				}
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
