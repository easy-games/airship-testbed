import { Signal } from "@Easy/Core/Shared/Util/Signal";

export class MobileJoystickDriver {
	private static inst: MobileJoystickDriver;

	public readonly changed = new Signal<[position: Vector3, phase: MobileJoystickPhase]>();

	private constructor() {
		// UserInputService.InputProxy.OnMobileJoystickEvent((position, phase) => {
		// 	this.Changed.Fire(position, phase);
		// });
	}

	public SetVisible(visible: boolean) {
		// InputBridge.Instance.SetMobileJoystickVisible(visible);
	}

	public IsVisible() {
		// return InputBridge.Instance.IsMobileJoystickVisible();
	}

	/** **NOTE:** Internal only. Use `Touchscreen` class instead. */
	public static Instance() {
		return (this.inst ??= new MobileJoystickDriver());
	}
}
