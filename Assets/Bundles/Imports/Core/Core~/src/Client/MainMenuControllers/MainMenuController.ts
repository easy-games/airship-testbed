import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { CoreUI } from "Shared/UI/CoreUI";
import { Mouse } from "Shared/UserInput";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { decode } from "Shared/json";

@Controller({})
export class MainMenuController implements OnStart {
	public gameCoordinatorUrl = "https://game-coordinator-fxy2zritya-uc.a.run.app/";

	OnStart(): void {
		const mainMenuPrefab = AssetBridge.LoadAsset("Imports/Core/Client/Resources/MainMenu/MainMenu.prefab");
		const mainMenu = Object.Instantiate(mainMenuPrefab) as GameObject;

		if (Game.Context === CoreContext.GAME) {
			mainMenu.GetComponent<Canvas>().enabled = false;
		}

		const mouse = new Mouse();
		mouse.AddUnlocker();

		const refs = mainMenu.GetComponent<GameObjectReferences>();
		const createServerButton = refs.GetValue("UI", "CreateServerButton");
		CoreUI.SetupButton(createServerButton);

		CanvasAPI.OnClickEvent(createServerButton, () => {
			print("pressed create server!");
			try {
				const res = InternalHttpManager.PostAsync(`${this.gameCoordinatorUrl}/custom-servers/allocate`, "{}");
				const data = decode(res.data) as {
					address: string;
					port: number;
				};
				TransferManager.ConnectToServer(data.address, data.port);
			} catch (err) {
				warn("failed to create server: " + err);
				return;
			}
		});
	}
}
