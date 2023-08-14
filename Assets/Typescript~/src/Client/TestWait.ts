import { WaitFrame } from "Imports/Core/Shared/Util/TimeUtil";

export function TestWait() {
	print("beginning test...");
	while (true) {
		print("wait");
		// wait();
		WaitFrame();
	}
}
