import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class CoreUIController {
	public readonly coreUIGO: GameObject;
	public readonly refs: GameObjectReferences;

	constructor() {
		this.coreUIGO = Object.Instantiate(
			AssetBridge.Instance.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/CoreUI.prefab"),
			CoreRefs.protectedTransform,
		);
		this.coreUIGO.name = "CoreUI";
		this.refs = this.coreUIGO.GetComponent<GameObjectReferences>()!;

		contextbridge.callback<(fromContext: LuauContext) => GameObjectReferences>("CoreUIController:GetRefs", () => {
			return this.refs;
		});
	}

	protected OnStart(): void {}
}
