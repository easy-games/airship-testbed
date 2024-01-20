import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export default class ClientScript extends AirshipBehaviour {
	override Start(): void {
		if (RunUtil.IsServer()) return;

		// Only runs on client
		const coreClientSignals = import("@Easy/Core/Client/CoreClientSignals").expect().CoreClientSignals;
		coreClientSignals.EntityDeath;
	}

	override OnDestroy(): void {}
}
