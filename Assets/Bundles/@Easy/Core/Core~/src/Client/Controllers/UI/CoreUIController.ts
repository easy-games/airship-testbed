import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreRefs } from "Shared/CoreRefs";

@Controller({})
export class CoreUIController implements OnStart {
	public readonly coreUIGO: GameObject;
	public readonly refs: GameObjectReferences;

	constructor() {
		this.coreUIGO = Object.Instantiate(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/CoreUI.prefab"),
			CoreRefs.rootTransform,
		);
		this.coreUIGO.name = "CoreUI";
		this.refs = this.coreUIGO.GetComponent<GameObjectReferences>();
	}

	OnStart(): void {}
}
