import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { EncodeJSON } from "@Easy/Core/Shared/json";
import { AuthController } from "../Auth/AuthController";
import { SocketController } from "../Socket/SocketController";

@Controller({})
export class MainMenuAddFriendsController implements OnStart {
	private sentRequests = new Set<string>();

	private canvas: Canvas | undefined;
	private inputFieldSelected = false;

	constructor(private readonly authController: AuthController, private readonly socketController: SocketController) {}

	OnStart(): void {}

	public Open(): void {
		if (this.canvas === undefined) {
			const go = Object.Instantiate(
				AssetBridge.Instance.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/AddFriends.prefab"),
			);
			this.canvas = go.GetComponent<Canvas>()!;
			this.canvas.enabled = false;

			const refs = go.GetComponent<GameObjectReferences>()!;
			const searchInput = refs.GetValue("UI", "SearchBar") as TMP_InputField;
			const closeButton = refs.GetValue("UI", "CloseButton");
			const responseText = refs.GetValue("UI", "ResponseText") as TMP_Text;
			const sentRequestsContent = refs.GetValue("UI", "SentRequestsContent");
			const sendButton = refs.GetValue("UI", "SendButton");

			CanvasAPI.OnSelectEvent(searchInput.gameObject, () => {
				this.inputFieldSelected = true;
			});
			CanvasAPI.OnDeselectEvent(searchInput.gameObject, () => {
				this.inputFieldSelected = false;
			});
			const keyboard = new Keyboard();
			keyboard.keyDown.ConnectWithPriority(SignalPriority.HIGH, (e) => {
				if (this.inputFieldSelected) {
					if (e.key !== Key.Enter && e.key !== Key.Escape) {
						e.SetCancelled(true);
					}
				}
			});

			sentRequestsContent.ClearChildren();

			const SetResponseText = (color: "success" | "error", text: string) => {
				responseText.text = text;
				responseText.color =
					color === "success" ? ColorUtil.HexToColor("#62FF5F") : ColorUtil.HexToColor("#FF5C4E");
				responseText.gameObject.SetActive(true);
			};

			const SendFriendRequest = (username: string) => {
				print('adding friend: "' + username + '"');
				const res = InternalHttpManager.PostAsync(
					AirshipUrl.GameCoordinator + "/friends/requests/self",
					EncodeJSON({
						username,
					}),
				);
				print("status code=" + res.statusCode);
				if (res.success) {
					SetResponseText("success", `Sent friend request to ${username}`);

					if (this.sentRequests.has(username)) {
						return;
					}
					this.sentRequests.add(username);
					const sentRequestGo = GameObjectUtil.InstantiateIn(
						AssetBridge.Instance.LoadAsset(
							"AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/SentFriendRequest.prefab",
						),
						sentRequestsContent.transform,
					);
					const sentRefs = sentRequestGo.GetComponent<GameObjectReferences>()!;
					const usernameText = sentRefs.GetValue("UI", "Username") as TMP_Text;
					usernameText.text = username;

					const cancelButton = sentRefs.GetValue("UI", "CancelButton");
					CoreUI.SetupButton(cancelButton);
					CanvasAPI.OnClickEvent(cancelButton, () => {
						GameObjectUtil.Destroy(sentRequestGo);
					});
				} else if (res.statusCode === 422) {
					SetResponseText("error", `Player ${username} does not exist.`);
				} else {
					SetResponseText("error", "Failed to send friend request.");
					error(res.error);
				}
			};

			CoreUI.SetupButton(sendButton);
			CanvasAPI.OnClickEvent(sendButton, () => {
				SendFriendRequest(searchInput.text);
			});

			CanvasAPI.OnInputFieldSubmit(searchInput.gameObject, () => {
				SendFriendRequest(searchInput.text);
			});

			keyboard.OnKeyDown(Key.NumpadEnter, () => {
				if (this.inputFieldSelected) {
					SendFriendRequest(searchInput.text);
				}
			});

			CoreUI.SetupButton(closeButton);
			CanvasAPI.OnClickEvent(closeButton, () => {
				AppManager.Close();
			});
		}

		const refs = this.canvas.gameObject.GetComponent<GameObjectReferences>()!;
		const searchInput = refs.GetValue("UI", "SearchBar") as TMP_InputField;
		const responseText = refs.GetValue("UI", "ResponseText") as TMP_Text;

		searchInput.text = "";
		searchInput.Select();
		responseText.gameObject.SetActive(false);

		AppManager.Open(this.canvas, {
			noOpenSound: true,
			addToStack: true,
			sortingOrderOffset: 100,
		});
		const wrapper = this.canvas.transform.GetChild(0);
		// wrapper.localPosition = new Vector3(0, 15, 0);
		// wrapper.TweenLocalPosition(new Vector3(0, 0, 0), 0.1);
	}
}
