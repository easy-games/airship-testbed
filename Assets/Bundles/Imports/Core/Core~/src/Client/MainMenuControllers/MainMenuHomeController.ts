import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { CoreUI } from "Shared/UI/CoreUI";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { decode } from "Shared/json";
import { MainMenuController } from "./MainMenuController";
import { GameServer } from "./Social/SocketAPI";

@Controller({})
export class MainMenuHomeController implements OnStart {
	public gameCoordinatorUrl = "https://game-coordinator-fxy2zritya-uc.a.run.app/";
	private errorMessageText: TMP_Text;
	private errorMessageWrapper: GameObject;
	private errorCloseButton: GameObject;
	private createServerButton: GameObject;
	private createLobbyButton: GameObject;
	private localBundlesToggle: Toggle;

	constructor(private readonly mainMenuController: MainMenuController) {
		this.errorMessageText = this.mainMenuController.refs.GetValue("UI", "ErrorMessageText");
		this.errorMessageWrapper = this.mainMenuController.refs.GetValue("UI", "ErrorMessageWrapper");

		this.createServerButton = this.mainMenuController.refs.GetValue("UI", "CreateServerButton");
		CoreUI.SetupButton(this.createServerButton);

		this.createLobbyButton = this.mainMenuController.refs.GetValue("UI", "CreateLobbyButton");
		CoreUI.SetupButton(this.createLobbyButton);

		this.errorCloseButton = this.mainMenuController.refs.GetValue("UI", "ErrorCloseButton");
		CoreUI.SetupButton(this.errorCloseButton);

		this.localBundlesToggle = this.mainMenuController.refs.GetValue("UI", "LocalBundlesToggle");

		if (Game.Context === CoreContext.GAME) {
			this.mainMenuController.mainContentCanvas.enabled = false;
			this.mainMenuController.socialMenuCanvas.enabled = false;
		}
	}

	OnStart(): void {
		this.Setup();
	}

	public Setup(): void {
		CanvasAPI.OnClickEvent(this.createServerButton, () => {
			this.SetButtonLoadingState(this.createServerButton, true);
			this.UpdateCrossSceneState();

			print("pressed create server!");

			const res = InternalHttpManager.PostAsync(`${this.gameCoordinatorUrl}/custom-servers/allocate`, "{}");
			if (res.success) {
				print("data: " + res.data);
				const data = decode(res.data) as {
					gameServer: GameServer;
				};
				print(`got server ${data.gameServer.ip}:${data.gameServer.port}`);
				TransferManager.Instance.ConnectToServer(data.gameServer.ip, data.gameServer.port);
			} else {
				warn("failed to create server: " + res.error);
				this.SetError(tostring(res.error));
			}
			this.SetButtonLoadingState(this.createServerButton, false);
		});

		CanvasAPI.OnClickEvent(this.createLobbyButton, () => {
			this.SetButtonLoadingState(this.createLobbyButton, true);
			this.UpdateCrossSceneState();

			print("pressed create server!");
			const res = InternalHttpManager.PostAsync(`${this.gameCoordinatorUrl}/custom-servers/lobby/allocate`, "{}");
			if (res.success) {
				print("data: " + res.data);
				const data = decode(res.data) as {
					gameServer: GameServer;
				};
				print(`got server ${data.gameServer.ip}:${data.gameServer.port}`);
				TransferManager.Instance.ConnectToServer(data.gameServer.ip, data.gameServer.port);
			} else {
				warn("failed to create server: " + res.error);
				this.SetError(tostring(res.error));
			}
			this.SetButtonLoadingState(this.createLobbyButton, false);
		});

		CanvasAPI.OnClickEvent(this.errorCloseButton, () => {
			this.CloseError();
		});

		const joinCodeButton = this.mainMenuController.refs.GetValue("UI", "JoinCodeButton");
		const joinCodeWrapper = this.mainMenuController.refs.GetValue("UI", "JoinCodeWrapper");
		const joinCodeConnectButton = this.mainMenuController.refs.GetValue("UI", "JoinCodeConnectButton");
		const joinCodeTextInput = this.mainMenuController.refs.GetValue<TMP_InputField>("UI", "JoinCodeField");

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

		const localServerButton = this.mainMenuController.refs.GetValue("UI", "LocalServerButton");
		CoreUI.SetupButton(localServerButton);
		CanvasAPI.OnClickEvent(localServerButton, () => {
			this.UpdateCrossSceneState();
			TransferManager.Instance.ConnectToServer("127.0.0.1", 7770);
		});

		const quitButton = this.mainMenuController.refs.GetValue("UI", "QuitButton");
		CoreUI.SetupButton(quitButton);
		CanvasAPI.OnClickEvent(quitButton, () => {
			Application.Quit();
		});
	}

	public ConnectToWithCode(code: string): void {
		this.UpdateCrossSceneState();

		const res = InternalHttpManager.GetAsync(
			`${this.gameCoordinatorUrl}/custom-servers/gameId/bedwars/code/${code}`,
		);
		if (res.success) {
			print("data: " + res.data);
			const data = decode(res.data) as {
                gameServer: GameServer;
			};
			print(`found server ${data.gameServer.ip}:${data.gameServer.port}`);
			TransferManager.Instance.ConnectToServer(data.gameServer.ip, data.gameServer.port);
		} else {
			warn("failed to create server: " + res.error);
			this.SetError(tostring(res.error));
		}
	}

	private SetButtonLoadingState(button: GameObject, loading: boolean): void {
		const text = button.transform.GetChild(0);
		const spinner = button.transform.GetChild(1);

		text.gameObject.SetActive(!loading);
		spinner.gameObject.SetActive(loading);
	}

	private UpdateCrossSceneState(): void {
		// CrossSceneState.UseLocalBundles = this.localBundlesToggle.isOn;
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
