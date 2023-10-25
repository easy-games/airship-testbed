import { Signal } from "./Signal";

export class Window {
	private static proxy = WindowCore.Window;

	public static FocusChanged = new Signal<[hasFocus: boolean]>();

	public static HasFocus() {
		return this.proxy.HasFocus();
	}
}

// Driver:
WindowCore.Window.OnWindowFocus((hasFocus) => {
	Window.FocusChanged.Fire(hasFocus);
});
