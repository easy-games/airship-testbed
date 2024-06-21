import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import AirshipButton from "../AirshipButton";

export default class SendFriendRequestModal extends AirshipBehaviour {
	public inputField!: TMP_InputField;
	public sendButton!: Button;
	public responseText!: TMP_Text;
	public inputOutlineGO!: GameObject;

	private bin = new Bin();

	override Start(): void {
		this.responseText.text = "";

		const keyboard = new Keyboard();
		this.bin.Add(keyboard);

		const sendButtonComp = this.sendButton.gameObject.GetAirshipComponent<AirshipButton>()!;
		keyboard.OnKeyDown(Key.Enter, (event) => {
			sendButtonComp.PlayMouseDownEffect();
			if (EventSystem.current.currentSelectedGameObject === this.inputField.gameObject) {
				task.spawn(() => {
					this.SendFriendRequest();
				});
			}
		});
		keyboard.OnKeyUp(Key.Enter, (event) => {
			sendButtonComp.PlayMouseUpEffect();
		});

		task.delay(0, () => {
			this.inputField.Select();
		});

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.sendButton.gameObject, () => {
				task.spawn(() => {
					this.SendFriendRequest();
				});
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnSubmitEvent(this.inputField.gameObject, () => {
				task.spawn(() => {
					this.SendFriendRequest();
				});
			}),
		);
	}

	public SendFriendRequest(): void {
		this.inputOutlineGO.SetActive(false);
		this.responseText.text = "";

		let username = this.inputField.text;
		if (username === "") return;

		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/friends/requests/self",
			json.encode({
				username,
			}),
		);
		if (!res.success) {
			if (res.statusCode === 422) {
				this.responseText.text = `Player "${username}\" does not exist.`;
			} else {
				this.responseText.text = "Failed to send friend requst. Please try again later.";
			}
			this.responseText.color = Theme.red;
			task.delay(0, () => {
				this.inputField.Select();
			});
			return;
		}

		this.responseText.text = `Done! You sent a friend request to <b>${username}</b>`;
		this.responseText.color = ColorUtil.HexToColor("#3BE267");
		this.inputOutlineGO.SetActive(true);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
