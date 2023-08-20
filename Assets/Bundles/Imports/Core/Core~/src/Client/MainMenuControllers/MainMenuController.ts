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
	private refs: GameObjectReferences;
	private errorMessageText: TMP_Text;
	private errorMessageWrapper: GameObject;
	private errorCloseButton: GameObject;
	private createServerButton: GameObject;
	private localBundlesToggle: Toggle;

	constructor() {
		const mainMenuPrefab = AssetBridge.LoadAsset("Imports/Core/Client/Resources/MainMenu/MainMenu.prefab");
		const mainMenu = Object.Instantiate(mainMenuPrefab) as GameObject;

		const mouse = new Mouse();
		mouse.AddUnlocker();

		this.refs = mainMenu.GetComponent<GameObjectReferences>();
		this.errorMessageText = this.refs.GetValue("UI", "ErrorMessageText");
		this.errorMessageWrapper = this.refs.GetValue("UI", "ErrorMessageWrapper");

		this.createServerButton = this.refs.GetValue("UI", "CreateServerButton");
		CoreUI.SetupButton(this.createServerButton);

		this.errorCloseButton = this.refs.GetValue("UI", "ErrorCloseButton");
		CoreUI.SetupButton(this.errorCloseButton);

		this.localBundlesToggle = this.refs.GetValue("UI", "LocalBundlesToggle");

		if (Game.Context === CoreContext.GAME) {
			mainMenu.GetComponent<Canvas>().enabled = false;
		}
	}

	OnStart(): void {
		CanvasAPI.OnClickEvent(this.createServerButton, () => {
			this.UpdateCrossSceneState();

			print("pressed create server!");
			try {
				const res = InternalHttpManager.PostAsync(`${this.gameCoordinatorUrl}/custom-servers/allocate`, "{}");
				print("data: " + res.data);
				const data = decode(res.data) as {
					ip: string;
					port: number;
				};
				print(`got server ${data.ip}:${data.port}`);
				TransferManager.Instance.ConnectToServer(data.ip, data.port);
			} catch (err) {
				warn("failed to create server: " + err);
				this.SetError(tostring(err));
			}
		});

		CanvasAPI.OnClickEvent(this.errorCloseButton, () => {
			this.CloseError();
		});

		const joinCodeButton = this.refs.GetValue("UI", "JoinCodeButton");
		const joinCodeWrapper = this.refs.GetValue("UI", "JoinCodeWrapper");
		const joinCodeConnectButton = this.refs.GetValue("UI", "JoinCodeConnectButton");
		const joinCodeTextInput = this.refs.GetValue<TMP_InputField>("UI", "JoinCodeField");

		CoreUI.SetupButton(joinCodeButton);
		CanvasAPI.OnClickEvent(joinCodeButton, () => {
			joinCodeWrapper.SetActive(!joinCodeWrapper.active);

			if (!joinCodeButton.active) {
				joinCodeTextInput.text = "";
			}
		});

		CoreUI.SetupButton(joinCodeConnectButton);
		CanvasAPI.OnClickEvent(joinCodeConnectButton, () => {
			print("join code connect button");
			const code = joinCodeTextInput.text;
			this.ConnectToWithCode(code);
		});

		const localServerButton = this.refs.GetValue("UI", "LocalServerButton");
		CoreUI.SetupButton(localServerButton);
		CanvasAPI.OnClickEvent(localServerButton, () => {
			this.UpdateCrossSceneState();
			TransferManager.Instance.ConnectToServer("127.0.0.1", 7770);
		});
	}

	public ConnectToWithCode(code: string): void {
		this.UpdateCrossSceneState();

		try {
			const res = InternalHttpManager.GetAsync(
				`${this.gameCoordinatorUrl}/custom-servers/gameId/bedwars/code/${code}`,
			);
			print("data: " + res.data);
			const data = decode(res.data) as {
				ip: string;
				port: number;
			};
			print(`found server ${data.ip}:${data.port}`);
			TransferManager.Instance.ConnectToServer(data.ip, data.port);
		} catch (err) {
			warn("failed to create server: " + err);
			this.SetError(tostring(err));
		}
	}

	private UpdateCrossSceneState(): void {
		CrossSceneState.UseLocalBundles = this.localBundlesToggle.isOn;
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
