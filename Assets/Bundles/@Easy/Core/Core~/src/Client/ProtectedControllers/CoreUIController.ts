import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class CoreUIController implements OnStart {
	public readonly coreUIGO: GameObject;
	public readonly refs: GameObjectReferences;

	constructor() {
		this.coreUIGO = Object.Instantiate(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/CoreUI.prefab"),
			CoreRefs.protectedTransform,
		);
		this.coreUIGO.name = "CoreUI";
		this.refs = this.coreUIGO.GetComponent<GameObjectReferences>()!;

		contextbridge.callback<(fromContext: LuauContext) => GameObjectReferences>("CoreUIController:GetRefs", () => {
			return this.refs;
		});
	}

	OnStart(): void {}
}
