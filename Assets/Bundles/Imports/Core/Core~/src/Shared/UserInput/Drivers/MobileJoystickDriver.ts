import { Signal } from "Shared/Util/Signal";

export class MobileJoystickDriver {
	private static inst: MobileJoystickDriver;

	public readonly Changed = new Signal<[position: Vector3, phase: MobileJoystickPhase]>();

	private constructor() {
		// UserInputService.InputProxy.OnMobileJoystickEvent((position, phase) => {
		// 	this.Changed.Fire(position, phase);
		// });
	}

	public SetVisible(visible: boolean) {
		UserInputService.InputProxy.SetMobileJoystickVisible(visible);
	}

	public IsVisible() {
		return UserInputService.InputProxy.IsMobileJoystickVisible();
	}

	/** **NOTE:** Internal only. Use `Touchscreen` class instead. */
	public static instance() {
		return (this.inst ??= new MobileJoystickDriver());
	}
}
