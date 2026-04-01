import Character from "@Easy/Core/Shared/Character/Character";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { ControlScheme, Preferred } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Airship } from "../../Airship";
import { Game } from "../../Game";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
import { LocalCharacterSingleton } from "./LocalCharacterSingleton";

export class CharacterInput {
	private readonly bin = new Bin();
	private readonly movement?: CharacterMovement;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	private enabled = true;

	/** If true holding the sprint key will not result in sprinting */
	private blockSprint = false;

	private clearQueueNextFrame = false;
	private queuedMoveDirections: { direction: Vector3; dt: number }[] = [];

	constructor(private readonly character: Character) {
		this.movement = character.movement;
		this.InitControls();
	}

	/**
	 * Sets whether or not the Humanoid Driver is enabled. If disabled, then the
	 * character will not move from user input.
	 * @param enabled Enabled state.
	 */
	public SetEnabled(enabled: boolean) {
		this.enabled = enabled;
		if (!enabled) {
			const localCharacterSingleton = Dependency<LocalCharacterSingleton>();

			if (Game.playerFlags.has("HasTransformMoveDirection")) {
				this.movement?.SetMoveInput(Vector3.zero, false, false, false);
			} else {
				this.movement?.SetMoveInput(
					Vector3.zero,
					false,
					false,
					false,
					localCharacterSingleton.GetMoveDirMode(),
				);
			}
		}
	}

	public SetQueuedMoveDirection(dir: Vector3): void {
		this.queuedMoveDirections.push({ direction: dir, dt: Time.deltaTime });
	}

	/** Returns `true` if the Humanoid Driver is enabled. */
	public IsEnabled() {
		return this.enabled;
	}

	public IsSprinting(): boolean {
		if (this.IsSprintBlocked()) return false;

		if (Airship.Input.IsSprintToggleEnabled()) {
			return Airship.Input.isSprintToggleSprinting;
		}

		return Airship.Input.IsDown("Sprint");
	}

	public AddDisabler(): () => void {
		const id = this.disablerCounter;
		this.disablerCounter++;
		this.disablers.add(id);
		this.SetEnabled(false);
		return () => {
			this.disablers.delete(id);
			if (this.disablers.size() === 0) {
				this.SetEnabled(true);
			} else {
				this.SetEnabled(false);
			}
		};
	}

	private InitControls() {
		const preferred = this.bin.Add(new Preferred());
		const localCharacterSingleton = Dependency<LocalCharacterSingleton>();

		const updateMouseKeyboardControls = (dt: number) => {
			if (!this.enabled) return;
			if (EventSystem.current.currentSelectedGameObject !== undefined) {
				return;
			}

			const [success, err] = pcall(() => {
				const w = Airship.Input.IsDown("Forward");
				const s = Airship.Input.IsDown("Back");
				const a = Airship.Input.IsDown("Left");
				const d = Airship.Input.IsDown("Right");

				const forward = w === s ? 0 : w ? 1 : -1;
				const sideways = d === a ? 0 : d ? 1 : -1;

				if (this.clearQueueNextFrame) {
					this.queuedMoveDirections.clear();
					this.clearQueueNextFrame = false;
				}
				this.queuedMoveDirections.push({ direction: new Vector3(sideways, 0, forward), dt });
			});
			if (!success) {
				print(err);
			}
		};

		// Switch controls based on preferred user input:
		preferred.ObserveControlScheme((controlScheme) => {
			const controlSchemeBin = new Bin();

			if (controlScheme === ControlScheme.MouseKeyboard) {
				controlSchemeBin.Connect(OnUpdate, updateMouseKeyboardControls);
			}

			// Clean up current controls when preferred input scheme changes:
			return () => {
				controlSchemeBin.Clean();
			};
		});

		this.bin.Add(
			OnUpdate.Connect((dt) => {
				if (!localCharacterSingleton.IsDefaultMovementEnabled()) return;
				if (!this.movement) return;

				let sprinting = this.IsSprinting();

				let moveDir = Vector3.zero;
				if (this.queuedMoveDirections.size() !== 0) {
					const totalDt = this.queuedMoveDirections.reduce((acc, input) => (acc += input.dt), 0);
					moveDir = this.queuedMoveDirections
						.reduce(
							(acc, input) => {
								return acc.add(input.direction.mul(input.dt));
							},
							new Vector3(0, 0, 0),
						)
						.div(totalDt);
				}

				if (Game.playerFlags.has("HasTransformMoveDirection")) {
					moveDir = this.movement.TransformMoveDirection(moveDir, localCharacterSingleton.GetMoveDirMode());
				}

				const moveSignal = new LocalCharacterInputSignal(
					moveDir,
					this.enabled ? Airship.Input.IsDown("Jump") : false,
					sprinting,
					this.enabled ? Airship.Input.IsDown("Crouch") : false,
				);
				localCharacterSingleton.onBeforeLocalEntityInput.Fire(moveSignal);

				if (Game.playerFlags.has("HasTransformMoveDirection")) {
					this.movement.SetMoveInput(
						moveSignal.moveDirection,
						moveSignal.jump,
						moveSignal.sprinting,
						moveSignal.crouch,
					);
				} else {
					this.movement.SetMoveInput(
						moveSignal.moveDirection,
						moveSignal.jump,
						moveSignal.sprinting,
						moveSignal.crouch,
						localCharacterSingleton.GetMoveDirMode(),
					);
				}
			}),
		);

		this.bin.Add(
			this.character.OnAddCustomInputData.Connect(() => {
				// We clear queued input only when it is consumed by C#. OnAddCustomInputData is the callback
				// for character movement generating a new move input and consuming the queued input.
				// We clear next frame since we may run multiple fixed updates per frame, and we don't want to clear
				// input before we process all pending fixed updates.
				this.clearQueueNextFrame = true;
			}),
		);

		this.bin.Add(
			this.character.onDespawn.Connect(() => {
				this.Destroy();
			}),
		);
	}

	public Destroy() {
		this.bin.Clean();
	}

	/**
	 * Set wether sprint is blocked. When true the player's sprint key won't result in sprint state.
	 */
	public SetSprintBlocked(blocked: boolean) {
		if (blocked === this.blockSprint) return;
		this.blockSprint = blocked;
	}

	/** Returns true if player's sprint is currently blocked. */
	public IsSprintBlocked() {
		return this.blockSprint;
	}
}
