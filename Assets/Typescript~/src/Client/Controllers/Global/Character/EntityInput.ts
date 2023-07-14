import { Keyboard, MobileJoystick, Preferred } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { OnUpdate } from "Shared/Util/Timer";

export class EntityInput {
	private readonly bin = new Bin();
	private readonly entityDriver: EntityDriver;
	private disablers = new Set<number>();
	private disablerCounter = 1;

	private jumping = false;
	private enabled = true;

	constructor(private readonly characterGO: GameObject) {
		this.entityDriver = characterGO.GetComponent<EntityDriver>();
		this.InitControls();
	}

	/**
	 * Sets whether or not the Humanoid Driver is enabled. If disabled, then the
	 * character will not move from user input.
	 * @param enabled Enabled state.
	 */
	private SetEnabled(enabled: boolean) {
		this.enabled = enabled;
		if (!enabled) {
			this.entityDriver.SetMoveInput(Vector3.zero, false, false, false);
		}
	}

	/** Returns `true` if the Humanoid Driver is enabled. */
	public IsEnabled() {
		return this.enabled;
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

		const updateMouseKeyboardControls = (dt: number) => {
			if (!this.enabled) return;

			const [success, err] = pcall(() => {
				const jump = keyboard.IsKeyDown(KeyCode.Space);
				const w = keyboard.IsEitherKeyDown(KeyCode.W, KeyCode.UpArrow);
				const s = keyboard.IsEitherKeyDown(KeyCode.S, KeyCode.DownArrow);
				const a = keyboard.IsKeyDown(KeyCode.A);
				const d = keyboard.IsKeyDown(KeyCode.D);

				const leftShift = keyboard.IsKeyDown(KeyCode.LeftShift);
				const leftCtrl = keyboard.IsKeyDown(KeyCode.LeftControl);
				const c = keyboard.IsKeyDown(KeyCode.C);

				const forward = w === s ? 0 : w ? 1 : -1;
				const sideways = d === a ? 0 : d ? 1 : -1;

				const moveDirection = new Vector3(sideways, 0, forward);

				if (this.jumping !== jump) {
					this.jumping = jump;
				}

				this.entityDriver.SetMoveInput(moveDirection, jump, leftShift, leftCtrl || c);
			});
			if (!success) {
				print(err);
			}
		};

		const onMobileJoystickChanged = (position: Vector3, phase: MobileJoystickPhase) => {
			if (!this.enabled) return;
			this.entityDriver.SetMoveInput(position, false, false, false);
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
					controlSchemeBin.Connect(mobileJoystick.Changed, onMobileJoystickChanged);
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
