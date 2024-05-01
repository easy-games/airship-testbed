import { CoreRefs } from "Shared/CoreRefs";
import { Controller, OnStart } from "Shared/Flamework";

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

		contextbridge.callback<() => GameObjectReferences>("CoreUIController:GetRefs", () => {
			return this.refs;
		});
	}

	OnStart(): void {}
}
