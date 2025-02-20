import Character from "@Easy/Core/Shared/Character/Character";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { ControlScheme, Preferred } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Airship } from "../../Airship";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
import { LocalCharacterSingleton } from "./LocalCharacterSingleton";

export class CharacterInput {
	private readonly bin = new Bin();
	private readonly movement?: BasicCharacterMovement;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	private enabled = true;

	/** If true holding the sprint key will not result in sprinting */
	private blockSprint = false;

	private queuedMoveDirection = Vector3.zero;

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
			this.movement?.SetMoveInput(Vector3.zero, false, false, false, false);
		}
	}

	public SetQueuedMoveDirection(dir: Vector3): void {
		this.queuedMoveDirection = dir;
	}

	/** Returns `true` if the Humanoid Driver is enabled. */
	public IsEnabled() {
		return this.enabled;
	}

	public IsSprinting(): boolean {
		if (this.IsSprintBlocked()) return false;
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

		const updateMouseKeyboardControls = (dt: number) => {
			if (!this.enabled) return;
			if (EventSystem.current.currentSelectedGameObject !== undefined) return;

			const [success, err] = pcall(() => {
				const w = Airship.Input.IsDown("Forward");
				const s = Airship.Input.IsDown("Back");
				const a = Airship.Input.IsDown("Left");
				const d = Airship.Input.IsDown("Right");

				const forward = w === s ? 0 : w ? 1 : -1;
				const sideways = d === a ? 0 : d ? 1 : -1;

				this.queuedMoveDirection = new Vector3(sideways, 0, forward);
			});
			if (!success) {
				print(err);
			}
		};

		const onMobileJoystickChanged = (position: Vector3, phase: MobileJoystickPhase) => {
			if (!this.enabled) return;
			this.movement?.SetMoveInput(position, false, false, false, false);
		};

		const localCharacterSingleton = Dependency<LocalCharacterSingleton>();
		this.bin.Add(
			OnUpdate.Connect((dt) => {
				if (!localCharacterSingleton.IsDefaultMovementEnabled()) return;

				let sprinting = this.IsSprinting();

				const moveSignal = new LocalCharacterInputSignal(
					this.queuedMoveDirection,
					this.enabled ? Airship.Input.IsDown("Jump") : false,
					sprinting,
					this.enabled ? Airship.Input.IsDown("Crouch") : false,
				);
				localCharacterSingleton.onBeforeLocalEntityInput.Fire(moveSignal);

				this.movement?.SetMoveInput(
					moveSignal.moveDirection,
					moveSignal.jump,
					moveSignal.sprinting,
					moveSignal.crouch,
					localCharacterSingleton.IsMoveDirWorldSpace(),
				);
			}),
		);
		this.bin.Add(
			this.character.onDespawn.Connect(() => {
				this.Destroy();
			}),
		);

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
