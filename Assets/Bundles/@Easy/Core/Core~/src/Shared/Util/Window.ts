import { Signal } from "./Signal";

export class Window {
	private static proxy = WindowCore.Window;

	public static focusChanged = new Signal<[hasFocus: boolean]>();

	public static HasFocus() {
		return this.proxy.HasFocus();
	}
}

// Driver:
WindowCore.Window.OnWindowFocus((hasFocus) => {
	Window.focusChanged.Fire(hasFocus);
});
