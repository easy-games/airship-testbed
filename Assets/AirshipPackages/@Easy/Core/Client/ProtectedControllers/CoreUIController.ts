import { Asset } from "@Easy/Core/Shared/Asset";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class CoreUIController {
	public readonly coreUIGO: GameObject;

	constructor() {
		this.coreUIGO = Object.Instantiate(
			Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/CoreUI.prefab"),
			CoreRefs.protectedTransform,
		);
		this.coreUIGO.name = "CoreUI";
	}

	protected OnStart(): void {}
}