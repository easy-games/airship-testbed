import { Controller, OnStart } from "@easy-games/flamework-core";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";

@Controller({})
export class CoreUIController implements OnStart {
	public readonly CoreUIGO: GameObject;
	public readonly Refs: GameObjectReferences;

	constructor() {
		this.CoreUIGO = GameObjectUtil.Instantiate(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/CoreUI.prefab"),
		);
		this.CoreUIGO.name = "CoreUI";
		this.Refs = this.CoreUIGO.GetComponent<GameObjectReferences>();
	}

	OnStart(): void {}
}
