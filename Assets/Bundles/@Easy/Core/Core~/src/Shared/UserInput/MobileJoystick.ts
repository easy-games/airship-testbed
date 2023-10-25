import { Bin } from "Shared/Util/Bin";
import { Signal } from "Shared/Util/Signal";
import { MobileJoystickDriver } from "./Drivers/MobileJoystickDriver";

export class MobileJoystick {
	private readonly bin = new Bin();
	private readonly mobileJoystickDriver = MobileJoystickDriver.instance();

	/** Fires when the position of the joystick changes, including when it's released. */
	public readonly Changed = new Signal<[position: Vector3, phase: MobileJoystickPhase]>();

	/** Returns `true` if the mobile joystick is visible. */
	public IsVisible() {
		return this.mobileJoystickDriver.IsVisible();
	}

	/** Set the visibility of the mobile joystick. */
	public SetVisible(visible: boolean) {
		this.mobileJoystickDriver.SetVisible(visible);
	}

	constructor() {
		this.bin.Add(this.Changed);
		this.bin.Add(this.mobileJoystickDriver.Changed.Proxy(this.Changed));
	}

	/** Cleans up the mobile joystick listener. */
	public Destroy() {
		this.bin.Destroy();
	}
}
