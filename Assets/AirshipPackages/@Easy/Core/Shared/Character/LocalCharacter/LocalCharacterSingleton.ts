import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { AirshipCameraSingleton } from "../../Camera/AirshipCameraSingleton";
import { CharacterInput } from "./CharacterInput";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
import { MoveDirectionMode } from "./MoveDirectionMode";
@Singleton({
	loadOrder: 10000,
})
export class LocalCharacterSingleton {
	public readonly stateChanged = new Signal<[newState: CharacterState]>();

	private characterMovement: CharacterMovement | undefined;
	public input: CharacterInput | undefined;
	private prevState: CharacterState = CharacterState.Idle;
	private currentState: CharacterState = CharacterState.Idle;

	private firstSpawn = true;
	private sprintOverlayEmission?: EmissionModule;

	// private moveDirWorldSpace = false;
	private moveDirMode = MoveDirectionMode.Character;
	private movementEnabled = true;

	/**
	 * This can be used to change input before it's processed by the entity system.
	 */
	public readonly onBeforeLocalEntityInput = new Signal<LocalCharacterInputSignal>();

	OnStart() {
		if (!Game.IsClient()) return;
		Game.localPlayer.ObserveCharacter((character) => {
			if (!character) return;

			this.firstSpawn = false;

			const bin = new Bin();

			this.characterMovement = character.gameObject.GetComponent<CharacterMovement>()!;
			this.input = new CharacterInput(character);

			// Set up camera
			const airshipCameraSingleton = Dependency<AirshipCameraSingleton>();
			airshipCameraSingleton.SetupCamera(character);
			airshipCameraSingleton.SetupCameraControls(bin);

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
				airshipCameraSingleton.fps?.Destroy();
				if (airshipCameraSingleton.IsEnabled()) {
					// If the camera mode's target is _not_ the local character don't
					// clean up camera.
					const mode = airshipCameraSingleton.GetMode();
					if (mode) {
						const target = mode.GetTarget();
						const isTargetLocalCharacter = target === character.model;
						if (!isTargetLocalCharacter) return;
					}
					airshipCameraSingleton.CleanupCamera();
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
		// 	sprintOverlayGameObject.transform.SetParent(Airship.Camera.cameraRig.Instance().mainCamera.transform, false);
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
	public SetMoveDirMode(mode: MoveDirectionMode): void {
		this.moveDirMode = mode;
	}

	public GetMoveDirMode() {
		return this.moveDirMode;
	}

	public SetDefaultMovementEnabled(enabled: boolean) {
		this.movementEnabled = enabled;
	}

	public IsDefaultMovementEnabled() {
		return this.movementEnabled;
	}

	/**
	 * @internal
	 */
	public GetEntityDriver() {
		return this.characterMovement;
	}
}
