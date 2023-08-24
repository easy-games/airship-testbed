import { Controller, OnStart } from "@easy-games/flamework-core";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";

@Controller({})
export class CoreUIController implements OnStart {
	public readonly coreUIGO: GameObject;
	public readonly refs: GameObjectReferences;

	constructor() {
		this.coreUIGO = GameObjectUtil.Instantiate(
			AssetBridge.LoadAsset("Imports/Core/Shared/Resources/Prefabs/UI/CoreUI.prefab"),
		);
		this.coreUIGO.name = "CoreUI";
		this.refs = this.coreUIGO.GetComponent<GameObjectReferences>();
	}

	OnStart(): void {}
}
