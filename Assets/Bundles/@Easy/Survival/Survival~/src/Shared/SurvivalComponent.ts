import Character from "@Easy/Core/Shared/Character/Character";
import { Flamework } from "@Easy/Core/Shared/Flamework";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { TestParam, test } from "./TestModule";
import { Game } from "@Easy/Core/Shared/Game";
import { Airship } from "@Easy/Core/Shared/Airship";

export default class SurvivalComponent extends AirshipBehaviour {
	override Start(): void {
		let startTime = Time.time;
		Flamework.AddPath("assets/bundles/@Easy/Survival/shared/resources/ts", "^.*singleton.lua$");
		if (Game.IsClient()) {
			Flamework.AddPath("assets/bundles/@Easy/Survival/client/resources/ts", "^.*controller.lua$");
			Airship.loadingScreen.FinishLoading();
		}
		if (Game.IsServer()) {
			Flamework.AddPath("assets/bundles/@Easy/Survival/server/resources/ts", "^.*service.lua$");
		}
		Flamework.Ignite();
		let timeDiff = Time.time - startTime;
		print("[Survival]: Ignite time: " + timeDiff + " seconds.");

		print(test.hello);
	}

	override OnDestroy(): void {}

	public TestMethod(test: TestParam, character: Character): void {}
}
