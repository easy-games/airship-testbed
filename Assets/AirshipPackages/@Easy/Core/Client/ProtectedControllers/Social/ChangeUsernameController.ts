import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { OnFixedUpdate } from "@Easy/Core/Shared/Util/Timer";
import { ProtectedUserController } from "../Airship/User/UserController";
import { AuthController } from "../Auth/AuthController";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { isUnityMakeRequestError, UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class ChangeUsernameController {
	private canvas: Canvas;
	private responseText: TMP_Text;
	private submitButton: GameObject;
	private submitButtonDisabled: GameObject;
	private inputField: TMP_InputField;
	private inputFieldSelected = false;

	private lastCheckTime = 0;
	private lastCheckedUsername = "";
	private lastInputTime = 0;
	private checkInputDelay = 0.1;
	private checkUsernameCooldown = 0.1;

	private openBin = new Bin();

	constructor(private readonly authController: AuthController) {
		const go = Object.Instantiate(
			AssetBridge.Instance.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/ChangeUsername.prefab"),
			CoreRefs.protectedTransform,
		);
		this.canvas = go.GetComponent<Canvas>()!;
		this.canvas.enabled = false;

		const refs = go.GetComponent<GameObjectReferences>()!;
		this.responseText = refs.GetValue("UI", "ResponseText") as TMP_Text;
		this.submitButton = refs.GetValue("UI", "SubmitButton");
		this.submitButtonDisabled = refs.GetValue("UI", "SubmitButtonDisabled");
		this.inputField = refs.GetValue("UI", "SearchBar") as TMP_InputField;

		task.spawn(() => {
			const closeButton = refs.GetValue("UI", "CloseButton");
			CoreUI.SetupButton(closeButton);
			CanvasAPI.OnClickEvent(closeButton, () => {
				AppManager.Close();
			});

			CoreUI.SetupButton(this.submitButton);
			CanvasAPI.OnClickEvent(this.submitButton, () => {
				this.SubmitNameChange();
			});

			CanvasAPI.OnSelectEvent(this.inputField.gameObject, () => {
				this.inputFieldSelected = true;
			});
			CanvasAPI.OnDeselectEvent(this.inputField.gameObject, () => {
				this.inputFieldSelected = false;
			});
			Keyboard.onKeyDownSignal.ConnectWithPriority(SignalPriority.HIGH, (e) => {
				if (this.inputFieldSelected) {
					if (e.key !== Key.Enter && e.key !== Key.Escape) {
						e.SetCancelled(true);
					}
				}
			});
		});
	}

	public SubmitNameChange(): void {
		const text = this.inputField.text;

		try {
			client.users.update({ username: text }).expect();
			this.SetResponseText("success", `Success! Your name has been changed to "${text}".`);
			(
				Game.localPlayer as unknown as {
					UpdateUsername(text: string): void;
				}
			).UpdateUsername(text);
			Dependency<ProtectedUserController>().FetchLocalUser();
			this.submitButton.SetActive(false);
			this.submitButtonDisabled.SetActive(true);
		} catch (err) {
			if (isUnityMakeRequestError(err) && err.status === 409) {
				this.SetResponseText("error", `The username "${text}" is taken.`);
				return;
			}
			this.SetResponseText("error", "Failed to change username.");
		}
	}

	public SetResponseText(status: "success" | "error" | "none", text: string) {
		this.responseText.text = text;
		this.responseText.color =
			status === "success" ? ColorUtil.HexToColor("#62FF5F") : ColorUtil.HexToColor("#FF5C4E");
		this.responseText.gameObject.SetActive(true);

		this.submitButton.SetActive(status === "success");
		this.submitButtonDisabled.SetActive(status !== "success");
	}

	protected OnStart(): void { }

	private CheckUsername(): void {
		let username = this.inputField.text;
		if (this.lastCheckedUsername === username) return;
		if (username === "") {
			return this.SetResponseText("none", "");
		}

		this.lastCheckedUsername = username;

		try {
			const data = client.users.getUsernameAvailability({ username }).expect();
			if (data.available) {
				this.SetResponseText("success", "");
			} else {
				this.SetResponseText("none", "");
			}
		} catch {
			this.SetResponseText("error", "Error checking availability.");
		}
	}

	public Open(): void {
		if (!this.canvas) return;

		this.inputField.text = "";
		this.inputField.Select();
		this.SetResponseText("none", "");

		this.openBin.Add(
			OnFixedUpdate.Connect(() => {
				let dirty = this.inputField.text !== this.lastCheckedUsername;
				if (!dirty) return;

				if (
					Time.time - this.lastCheckTime > this.checkUsernameCooldown &&
					Time.time - this.lastInputTime > this.checkInputDelay
				) {
					this.CheckUsername();
				}
			}),
		);
		this.openBin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(this.inputField.gameObject, () => {
				this.lastInputTime = Time.time;
			}),
		);

		AppManager.OpenCanvas(this.canvas, {
			addToStack: true,
			sortingOrderOffset: 100,
			onClose: () => {
				this.openBin.Clean();
			},
		});
	}
}
