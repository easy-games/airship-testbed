import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export default class ClientScript extends AirshipBehaviour {
	override Start(): void {
		if (RunUtil.IsServer()) return;

		// Only runs on client
		const coreServerSignals = import("@Easy/Core/Client/CoreClientSignals").expect().CoreClientSignals;
	}

	override OnDestroy(): void {}
}
