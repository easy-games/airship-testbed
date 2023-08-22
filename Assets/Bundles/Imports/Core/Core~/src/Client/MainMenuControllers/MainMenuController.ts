import { Controller, OnStart } from "@easy-games/flamework-core";
import { Mouse } from "Shared/UserInput";

@Controller({})
export class MainMenuController implements OnStart {
	public currentUrl = "/home";
	public mainMenuGo: GameObject;
	public refs: GameObjectReferences;

	constructor() {
		const mainMenuPrefab = AssetBridge.LoadAsset("Imports/Core/Client/Resources/MainMenu/MainMenu.prefab");
		this.mainMenuGo = Object.Instantiate(mainMenuPrefab) as GameObject;

		this.refs = this.mainMenuGo.GetComponent<GameObjectReferences>();

		const mouse = new Mouse();
		mouse.AddUnlocker();
	}

	OnStart(): void {}

	public RouteTo(url: string, data?: unknown): void {}
}
