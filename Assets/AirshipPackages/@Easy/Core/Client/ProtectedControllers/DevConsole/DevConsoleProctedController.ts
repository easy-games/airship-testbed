import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

@Controller()
export class DevConsoleProtectedController implements OnStart {
	OnStart(): void {
		const openedBin = new Bin();

		DevConsole.OnConsoleOpened.Connect(() => {
			openedBin.Add(Mouse.AddUnlocker());
		});
		if (DevConsole.IsOpen) {
			openedBin.Add(Mouse.AddUnlocker());
		}

		DevConsole.OnConsoleClosed.Connect(() => {
			openedBin.Clean();
		});
	}
}
