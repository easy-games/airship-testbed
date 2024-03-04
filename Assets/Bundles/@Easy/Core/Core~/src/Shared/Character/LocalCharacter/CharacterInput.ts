import Character from "Shared/Character/Character";
import { Dependency } from "Shared/Flamework";
import { Keyboard, MobileJoystick, Preferred } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { OnUpdate } from "Shared/Util/Timer";
import { Airship } from "../../Airship";
import { LocalCharacterInputSignal } from "./LocalCharacterInputSignal";
import { LocalCharacterSingleton } from "./LocalCharacterSingleton";

export class CharacterInput {
	private readonly bin = new Bin();
	private readonly movement: CharacterMovement;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	private jumping = false;
	private enabled = true;
	private autoSprinting = false;

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
			this.movement.SetMoveInput(Vector3.zero, false, false, false, false);
		}
	}

	/** Returns `true` if the Humanoid Driver is enabled. */
	public IsEnabled() {
		return this.enabled;
	}

	public IsSprinting(): boolean {
		return this.autoSprinting || Airship.input.IsDown("Sprint");
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
		const keyboard = this.bin.Add(new Keyboard());
		const mobileJoystick = this.bin.Add(new MobileJoystick());
		const preferred = this.bin.Add(new Preferred());

		this.autoSprinting = false;
		this.bin.Add(
			this.character.onStateChanged.Connect((newState, oldState) => {
				if (newState === CharacterState.Sprinting) {
					this.autoSprinting = true;
				} else if (newState !== CharacterState.Jumping) {
					this.autoSprinting = false;
				}
			}),
		);
		this.bin.Add(
			keyboard.OnKeyDown(KeyCode.LeftShift, () => {
				if (this.autoSprinting) {
					this.autoSprinting = false;
				}
			}),
		);

		const updateMouseKeyboardControls = (dt: number) => {
			if (!this.enabled) return;
			if (EventSystem.current.currentSelectedGameObject !== undefined) return;

			const [success, err] = pcall(() => {
				const jump = Airship.input.IsDown("Jump");
				const w = Airship.input.IsDown("Forward");
				const s = Airship.input.IsDown("Back");
				const a = Airship.input.IsDown("Left");
				const d = Airship.input.IsDown("Right");

				const leftShift = Airship.input.IsDown("Sprint");
				const leftCtrl = Airship.input.IsDown("Crouch");
				// const c = Airship.input.IsDown("Crouch");

				const forward = w === s ? 0 : w ? 1 : -1;
				const sideways = d === a ? 0 : d ? 1 : -1;

				let sprinting = leftShift || this.autoSprinting;

				const moveDirection = new Vector3(sideways, 0, forward);

				if (this.jumping !== jump) {
					this.jumping = jump;
				}

				const moveSignal = new LocalCharacterInputSignal(moveDirection, jump, sprinting, leftCtrl);
				Dependency<LocalCharacterSingleton>().onBeforeLocalEntityInput.Fire(moveSignal);

				this.movement.SetMoveInput(
					moveSignal.moveDirection,
					moveSignal.jump,
					moveSignal.sprinting,
					moveSignal.crouchOrSlide,
					Dependency<LocalCharacterSingleton>().IsMoveDirWorldSpace(),
				);
			});
			if (!success) {
				print(err);
			}
		};

		const onMobileJoystickChanged = (position: Vector3, phase: MobileJoystickPhase) => {
			if (!this.enabled) return;
			this.movement.SetMoveInput(position, false, false, false, false);
		};

		// Switch controls based on preferred user input:
		preferred.ObserveControlScheme((controlScheme) => {
			const controlSchemeBin = new Bin();

			switch (controlScheme) {
				case "MouseKeyboard":
					mobileJoystick.SetVisible(false);
					controlSchemeBin.Connect(OnUpdate, updateMouseKeyboardControls);
					break;
				case "Touch":
					mobileJoystick.SetVisible(true);
					controlSchemeBin.Connect(mobileJoystick.changed, onMobileJoystickChanged);
					break;
				default:
					print(`unknown control scheme: ${controlScheme}`);
					break;
			}

			// Clean up current controls when preferred input scheme changes:
			return () => {
				controlSchemeBin.Destroy();
			};
		});
	}

	public Destroy() {
		this.bin.Destroy();
	}
}
