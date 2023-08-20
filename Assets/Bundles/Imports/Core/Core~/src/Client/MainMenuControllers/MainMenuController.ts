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
	private errorMessageText: TMP_Text;
	private errorMessageWrapper: GameObject;
	private errorCloseButton: GameObject;
	private createServerButton: GameObject;

	constructor() {
		const mainMenuPrefab = AssetBridge.LoadAsset("Imports/Core/Client/Resources/MainMenu/MainMenu.prefab");
		const mainMenu = Object.Instantiate(mainMenuPrefab) as GameObject;

		const mouse = new Mouse();
		mouse.AddUnlocker();

		const refs = mainMenu.GetComponent<GameObjectReferences>();
		this.errorMessageText = refs.GetValue("UI", "ErrorMessageText");
		this.errorMessageWrapper = refs.GetValue("UI", "ErrorMessageWrapper");

		this.createServerButton = refs.GetValue("UI", "CreateServerButton");
		CoreUI.SetupButton(this.createServerButton);

		this.errorCloseButton = refs.GetValue("UI", "ErrorCloseButton");
		CoreUI.SetupButton(this.errorCloseButton);

		if (Game.Context === CoreContext.GAME) {
			mainMenu.GetComponent<Canvas>().enabled = false;
		}
	}

	OnStart(): void {
		CanvasAPI.OnClickEvent(this.createServerButton, () => {
			print("pressed create server!");
			try {
				const res = InternalHttpManager.PostAsync(`${this.gameCoordinatorUrl}/custom-servers/allocate`, "{}");
				print("data: " + res.data);
				const data = decode(res.data) as {
					ip: string;
					port: number;
				};
				print(`got server ${data.ip}:${data.port}`);
				TransferManager.ConnectToServer(data.ip, data.port);
			} catch (err) {
				warn("failed to create server: " + err);
				this.SetError(tostring(err));
			}
		});

		CanvasAPI.OnClickEvent(this.errorCloseButton, () => {
			this.CloseError();
		});
	}

	public SetError(errorMessage: string): void {
		this.errorMessageText.text = errorMessage;
		this.errorMessageWrapper.SetActive(true);
	}

	public CloseError(): void {
		this.errorMessageText.text = "";
		this.errorMessageWrapper.SetActive(false);
	}
}
