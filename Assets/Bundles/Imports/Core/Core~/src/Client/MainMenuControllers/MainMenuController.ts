import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";

@Controller({})
export class MainMenuController implements OnStart {
	OnStart(): void {
		const mainMenuPrefab = AssetBridge.LoadAsset("Imports/Core/Client/Resources/MainMenu/MainMenu.prefab");
		const mainMenu = Object.Instantiate(mainMenuPrefab) as GameObject;

		if (Game.Context === CoreContext.GAME) {
			mainMenu.GetComponent<Canvas>().enabled = false;
		}
	}
}
