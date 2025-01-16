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
import { HttpRetry } from "@Easy/Core/Shared/Http/HttpRetry";

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
		const res = HttpManager.PatchAsync(
			AirshipUrl.GameCoordinator + "/users",
			json.encode({
				username: text,
			}),
			this.authController.GetAuthHeaders(),
		);
		if (res.success) {
			this.SetResponseText("success", `Success! Your name has been changed to "${text}".`);
			(
				Game.localPlayer as unknown as {
					UpdateUsername(text: string): void;
				}
			).UpdateUsername(text);
			Dependency<ProtectedUserController>().FetchLocalUser();
			this.submitButton.SetActive(false);
			this.submitButtonDisabled.SetActive(true);
		} else if (res.statusCode === 409) {
			this.SetResponseText("error", `The username "${text}" is taken.`);
		} else {
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

	protected OnStart(): void {}

	private CheckUsername(): void {
		let username = this.inputField.text;
		if (this.lastCheckedUsername === username) return;
		if (username === "") {
			return this.SetResponseText("none", "");
		}

		this.lastCheckedUsername = username;
		const res = HttpRetry(
			() => InternalHttpManager.GetAsync(
				AirshipUrl.GameCoordinator + "/users/availability?username=" + username,
			),
			{ retryKey: "get/game-coordinator/users/availability" }
		).expect();
		if (res.success) {
			const data = json.decode<{ available: boolean }>(res.data);
			if (data.available) {
				this.SetResponseText("success", "");
			} else {
				this.SetResponseText("none", "");
			}
		} else {
			this.SetResponseText("none", "");
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
