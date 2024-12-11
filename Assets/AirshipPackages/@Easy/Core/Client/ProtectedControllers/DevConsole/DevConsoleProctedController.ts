import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

@Controller()
export class DevConsoleProtectedController implements OnStart {
	OnStart(): void {
		const openedBin = new Bin();

		task.delay(0, () => {
			try {
				DevConsole.OnConsoleOpened.Connect(() => {
					openedBin.Add(Mouse.AddUnlocker());
					openedBin.Add(this.AddEscapeCloser());
				});
				if (DevConsole.IsOpen) {
					openedBin.Add(Mouse.AddUnlocker());
					openedBin.Add(this.AddEscapeCloser());
				}

				DevConsole.OnConsoleClosed.Connect(() => {
					openedBin.Clean();
				});
			} catch (err) {
				Debug.LogError("[Dev Console Hook]: " + err);
			}
		});
	}

	private AddEscapeCloser() {
		return Keyboard.OnKeyDown(Key.Escape, (e) => {
			e.SetCancelled(true);
			print("DevConsole escape");
			DevConsole.CloseConsole();
		});
	}
}
