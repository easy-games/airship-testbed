import { Dependency, Flamework } from "@easy-games/flamework-core";
import { LoadingScreenController } from "Client/Controllers/Loading/LoadingScreenController";
import { Bootstrap } from "Shared/Bootstrap/Bootstrap";
import { RunUtil } from "Shared/Util/RunUtil";

export default class MapEditEntryComponent extends AirshipBehaviour {
	override OnStart(): void {
		print("MapEdit.OnStart");
		Bootstrap.PrepareVoxelWorld();
		Bootstrap.Prepare();

		if (RunUtil.IsServer()) {
			Flamework.Ignite();
			Bootstrap.FinishedSetup();
		} else {
			Flamework.Ignite();
			Bootstrap.FinishedSetup();
			Dependency<LoadingScreenController>().FinishLoading();
		}
		print("Finished MapEdit setup.");
	}

	override OnDestroy(): void {}
}
