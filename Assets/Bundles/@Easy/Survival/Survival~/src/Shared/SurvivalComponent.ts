import { Flamework } from "@easy-games/flamework-core";
import { RunUtil } from "../../../../../Types~/@Easy/Core/Shared/Util/RunUtil";

export default class SurvivalComponent extends AirshipBehaviour {
	override Start(): void {
		let startTime = Time.time;
		Flamework.AddPath("assets/bundles/@Easy/Survival/shared/resources/ts", "^.*singleton.lua$");
		if (RunUtil.IsClient()) {
			Flamework.AddPath("assets/bundles/@Easy/Survival/client/resources/ts", "^.*controller.lua$");
		} else {
			Flamework.AddPath("assets/bundles/@Easy/Survival/server/resources/ts", "^.*service.lua$");
		}
		Flamework.Ignite();
		let timeDiff = Time.time - startTime;
		print("[Survival]: Ignite time: " + timeDiff + " seconds.");
	}

	override OnDestroy(): void {}
}
